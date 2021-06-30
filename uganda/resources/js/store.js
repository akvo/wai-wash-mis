import { Store } from "pullstate";

import hhData from "./data/ug_hh_data.json";
import hhConfig from "./data/ug_hh_config.json";

import schoolData from "./data/ug_school_data.json";
import schoolConfig from "./data/ug_school_config.json";

import healthData from "./data/ug_health_data.json";
import healthConfig from "./data/ug_health_config.json";

// import cltsData from "./data/ug_clts_data.json";
// import cltsConfig from "./data/ug_clts_config.json";

import wpData from "./data/ug_wp_data.json";
import wpConfig from "./data/ug_wp_config.json";

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
    page: "detail",
    woreda: "Agago",
    kebele: null,
    firstFilter: "hh",
    secondFilter: "all",
    woredaList: [],
    kebeleList: [],
    markerDetail: {
        active: false,
        data: {},
    },
});
