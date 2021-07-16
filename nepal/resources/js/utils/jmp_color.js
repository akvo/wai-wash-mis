const hh = {
    water: [
        {
            name: "safely managed",
            color: "#3188D1",
        },
        {
            name: "basic",
            color: "#4FC3F7",
        },
        {
            name: "limited",
            color: "#FCF176",
        },
        {
            name: "unimproved",
            color: "#FAD54F",
        },
        {
            name: "no facility",
            color: "#F8B302",
        },
        {
            name: "no service",
            color: "#F8B302",
        },
    ],
    sanitation: [
        {
            name: "safely managed",
            color: "#388E3C",
        },
        {
            name: "basic",
            color: "#81C784",
        },
        {
            name: "limited",
            color: "#FCF176",
        },
        {
            name: "unimproved",
            color: "#FAD54F",
        },
        {
            name: "open defecation",
            color: "#F8B302",
        },
    ],
    hygiene: [
        {
            name: "basic",
            color: "#AB47BC",
        },
        {
            name: "limited",
            color: "#FCF176",
        },
        {
            name: "no facility",
            color: "#F9CA29",
        },
        {
            name: "no service",
            color: "#F9CA29",
        },
    ],
};

const schoolAndHealth = {
    water: [
        {
            name: "advanced",
            color: "#CFD8DB",
        },
        {
            name: "basic",
            color: "#40B1E6",
        },
        {
            name: "limited",
            color: "#FCF176",
        },
        {
            name: "no service",
            color: "#F9CA29",
        },
    ],
    sanitation: [
        {
            name: "advanced",
            color: "#CFD8DB",
        },
        {
            name: "basic",
            color: "#67B769",
        },
        {
            name: "limited",
            color: "#FCF176",
        },
        {
            name: "no services",
            color: "#F9CA29",
        },
    ],
    hygiene: [
        {
            name: "advanced",
            color: "#CFD8DB",
        },
        {
            name: "basic",
            color: "#AB47BC",
        },
        {
            name: "limited",
            color: "#FCF176",
        },
        {
            name: "no services",
            color: "#F9CA29",
        },
    ],
};

export const jmpColors = {
    hh: hh,
    school: schoolAndHealth,
    health: schoolAndHealth,
    facilities: {
        basic: "#67b769",
        limited: "#F9CA29",
        noService: "#dc3545",
    },
};
