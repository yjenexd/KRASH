export interface Sound {
  id: string;
  name: string;
  color: string;

  bass : number;
  middle : number;
  treble : number;
  createdAt: string;
}

export function detect(
    picked_up : Sound, 
    sounds : Sound[],
    threshold : number = 0.7) : Sound | null { 
    
    let best_sound : Sound | null = null;
    let best_similarity = 0;

    for (const sound of sounds) {
        const similarity_score = similarity(picked_up, sound);

        if (similarity_score > best_similarity
            && similarity_score >= threshold
        ) {   
            best_similarity = similarity_score;
            best_sound = sound;
        }
    }

    return best_sound;
}

function similarity(
    s1 : Sound, 
    s2 : Sound) : number {
    // we may assume that u1 and u2 are non-zero vectors

    const u1 = s1.bass*s1.bass + s1.middle*s1.middle + s1.treble*s1.treble;
    const u2 = s2.bass*s2.bass + s2.middle*s2.middle + s2.treble*s2.treble;
    const dot = s1.bass*s2.bass + s1.middle*s2.middle + s1.treble*s2.treble;

    return dot*dot / (u1 * u2); 
    // cos^2 theta but I don't think it really matters as long as the maximum is when u1 and u2 point in the same direction and decreasing the further they get
}