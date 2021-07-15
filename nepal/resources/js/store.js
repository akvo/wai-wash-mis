import { Store } from "pullstate";

import hhData from "./data/nep_hh_data.json";
import hhConfig from "./data/nep_hh_config.json";

import schoolData from "./data/nep_school_data.json";
import schoolConfig from "./data/nep_school_config.json";

import healthData from "./data/nep_health_data.json";
import healthConfig from "./data/nep_health_config.json";

// import cltsData from "./data/ug_clts_data.json";
// import cltsConfig from "./data/ug_clts_config.json";

import wpData from "./data/nep_wp_data.json";
import wpConfig from "./data/nep_wp_config.json";

let cltsData, cltsConfig;

export const UIStore = new Store({
    hh: {
        data: hhData,
        config: hhConfig,
    },
    school: {
        data: schoolData,
        config: schoolConfig,
    },
    health: {
        data: healthData,
        config: healthConfig,
    },
    clts: {
        data: cltsData,
        config: cltsConfig,
    },
    wp: {
        data: wpData,
        config: wpConfig,
    },
    state: {
        data: [],
        config: {},
        charts: null,
        tables: null,
    },
    page: "home",
    level1: null,
    level2: null,
    level3: null,
    firstFilter: "hh",
    secondFilter: "all",
    level1List: [],
    level2List: [],
    level3List: [],
    markerDetail: {
        active: false,
        data: {},
    },
});
