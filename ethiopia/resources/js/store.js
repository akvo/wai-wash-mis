import { Store } from "pullstate";

import hhData from "./data/eth_hh_data.json";
import hhConfig from "./data/eth_hh_config.json";

import schoolData from "./data/eth_school_data.json";
import schoolConfig from "./data/eth_school_config.json";

import healthData from "./data/eth_health_data.json";
import healthConfig from "./data/eth_health_config.json";

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
    state: {
        data: {},
        config: [],
        charts: null,
        tables: null,
    },
    page: "home",
    woreda: null,
    kebele: null,
    firstFilter: "hh",
    secondFilter: "all",
    woredaList: [],
    kebeleList: [],
});
