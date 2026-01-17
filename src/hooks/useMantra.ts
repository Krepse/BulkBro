import { useState, useEffect } from 'react';

const MANTRAS = [
    "LET'S BULKING GO, BRO!",
    "PAIN IS WEAKNESS LEAVING THE BULK, BRO!",
    "SHUT UP AND BULK, BRO!",
    "NO BULK, NO GLORY, BRO!",
    "SQUAT TILL YOU BARF, BRO!",
    "BULK UNTIL THE CASKET DROPS, BRO!",
    "REAL BROS NEVER MISS BULK DAY!",
    "BULK OR DIE, BRO!",
    "YOUR GIRLFRIEND CALLED, SHE WANTS HER BULK BACK, BRO!",
    "EAT BIG TO GET BIG, BULKBRO STYLE!",
    "SECOND PLACE IS FOR BROS WHO DON'T BULK!",
    "IF THE BAR AIN'T BENDING, YOU AIN'T BULKING, BRO!",
    "BULK THE PAIN AWAY, BRO!",
    "GO HARD OR GO HOME TO YOUR MAMA, BULKBRO!",
    "THE ONLY THING SMALLER THAN YOUR BULK IS YOUR HEART, BRO!",
    "EMBRACE THE BULK OR EMBRACE DEFEAT, BRO!",
    "BULK TILL THE BUTTONS POP, BRO!",
    "A BRO WITHOUT A BULK IS JUST A DUDE!",
    "LIFT HEAVY, BULK HARD, REPEAT BRO!",
    "WELCOME TO THE HOUSE OF BULK, BRO!",
];

export function useMantra() {
    const [mantra, setMantra] = useState('');

    useEffect(() => {
        setMantra(MANTRAS[Math.floor(Math.random() * MANTRAS.length)]);
    }, []);

    return mantra;
}
