import { Store } from "pullstate";

import hhData from "./data/eth_hh_data.json";
import hhConfig from "./data/eth_hh_config.json";

import schoolData from "./data/eth_school_data.json";
import schoolConfig from "./data/eth_school_config.json";

import healthData from "./data/eth_health_data.json";
import healthConfig from "./data/eth_health_config.json";

// import cltsData from "./data/ug_clts_data.json";
// import cltsConfig from "./data/ug_clts_config.json";

import wpData from "./data/eth_wp_data.json";
import wpConfig from "./data/eth_wp_config.json";

// CLTS
import cltsData from "./data/eth_clts_data.json";
import cltsConfig from "./data/eth_clts_config.json";

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
    wp: {
        data: wpData,
        config: wpConfig,
    },
    clts: {
        data: cltsData,
        config: cltsConfig,
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
    firstFilter: "hh",
    secondFilter: "all",
    level1List: [],
    level2List: [],
    markerDetail: {
        active: false,
        data: {},
    },
});
