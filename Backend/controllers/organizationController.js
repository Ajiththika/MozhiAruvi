import Organization from '../models/Organization.js';
import User from '../models/User.js';
import crypto from 'crypto';

export async function inviteMember(req, res, next) {
    try {
        const { email } = req.body;
        const org = await Organization.findOne({ owner: req.user.sub });
        if (!org) return res.status(404).json({ message: "Organization not found" });

        if (org.members.length >= org.maxSeats) {
            return res.status(400).json({ message: "No seats available. Upgrade your plan." });
        }

        // Check if already invited or member
        if (org.invitations.find(inv => inv.email === email && inv.status === 'pending')) {
            return res.status(400).json({ message: "Invitation already pending." });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        org.invitations.push({ email, token, expiresAt });
        await org.save();

        // In a real app, send email with token
        res.json({ message: "Invitation sent.", token }); 
    } catch (e) { next(e); }
}

export async function joinOrganization(req, res, next) {
    try {
        const { token } = req.body;
        const user = await User.findById(req.user.sub);
        if (!user) return res.status(404).json({ message: "User not found" });

        const org = await Organization.findOne({ "invitations.token": token });
        if (!org) return res.status(404).json({ message: "Invalid or expired invitation." });

        const invitation = org.invitations.find(inv => inv.token === token);
        if (invitation.status !== 'pending' || invitation.expiresAt < new Date()) {
            return res.status(400).json({ message: "Invitation no longer valid." });
        }

        if (org.members.length >= org.maxSeats) {
            return res.status(400).json({ message: "Organization full." });
        }

        // Join
        org.members.push(user._id);
        invitation.status = 'accepted';
        await org.save();

        user.organizationId = org._id;
        user.roleInOrg = 'member';
        user.subscription.plan = 'BUSINESS'; // gets premium-level access via BUSINESS plan
        await user.save();

        res.json({ message: "Joined successfully." });
    } catch (e) { next(e); }
}

export async function getOrganizationDetails(req, res, next) {
    try {
        const org = await Organization.findOne({ owner: req.user.sub }).populate('members', 'name email');
        if (!org) {
            // Check if user is member
            const memberOrg = await Organization.findOne({ members: req.user.sub }).populate('owner', 'name email');
            if (memberOrg) return res.json(memberOrg);
            return res.status(404).json({ message: "Not part of an organization." });
        }
        res.json(org);
    } catch (e) { next(e); }
}
