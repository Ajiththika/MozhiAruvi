/**
 * Normalizes admin question payloads before save.
 * Maps legacy fields (expectedAudioText, referenceAudio) to canonical schema.
 */
export function normalizeQuestionPayload(data) {
    const payload = { ...data };

    if (payload.referenceAudio && !payload.audioUrl) {
        payload.audioUrl = payload.referenceAudio;
    }
    delete payload.referenceAudio;

    const tamil = (payload.tamilWord || payload.expectedAudioText || '').trim();
    if (tamil) {
        payload.tamilWord = tamil;
        if (payload.textToSpeech === undefined) {
            payload.textToSpeech = true;
        }
    }

    if (payload.type === 'match' && payload.correctOptionIndex === undefined) {
        payload.correctOptionIndex = 0;
    }

    if (payload.pairs && Array.isArray(payload.pairs)) {
        payload.pairs = payload.pairs.map((p) => ({
            left: p.left || '',
            right: p.right || '',
            audioUrl: p.audioUrl || undefined,
            tamilWord: p.tamilWord || undefined,
        }));
    }

    return payload;
}

export function getTamilSpeechText(question) {
    if (!question) return '';
    return (question.tamilWord || question.expectedAudioText || '').trim();
}

export function shouldExposeSpeaker(question) {
    if (!question) return false;
    if (question.textToSpeech === false) return false;
    const hasContent = !!(getTamilSpeechText(question) || (question.audioUrl && question.audioUrl.startsWith('http')));
    if (question.textToSpeech === true) return hasContent;
    return hasContent;
}
