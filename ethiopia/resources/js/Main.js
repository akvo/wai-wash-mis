import React, { useState, useEffect } from "react";
import { Layout } from "antd";

import { UIStore } from "./store";

import Detail from "./pages/details/view";

import "./main.scss";
import { uniq, trim } from "lodash";

const wpSource = [
    {
        name: "School",
        column: "Water Supply Source",
        source: "school",
    },
    {
        name: "Household",
        column: "Main Source of Drinking Water",
        source: "hh",
    },
    {
        name: "Health Facilities",
        column: "Description of Water Supply in Health Facilities",
        source: "health",
    },
];

const handleLevelList = (store, level1 = null) => {
    return uniq(
        wpSource
            .map((s) => {
                const cf = store[s.source].config;
                let dt = store[s.source].data;
                dt = level1
                    ? dt
                          .filter(
                              (x) =>
                                  x[cf?.locations?.level1]?.toLowerCase() ===
                                  level1?.toLowerCase()
                          )
                          .map((x) => x[cf?.locations?.level2])
                    : dt?.map((x) => x[cf?.locations?.level1]);

                dt = dt.filter(
                    (value, index, self) => self.indexOf(value) === index
                );
                return dt;
            })
            .flatMap((s) => s)
            .filter((s) => trim(s) !== "")
    );
};

function Main() {
    const store = UIStore.useState();
    const { page, firstFilter, state } = store;

    useEffect(() => {
        const { data, config } = store?.[firstFilter];
        const { level1, level2 } = config?.locations;

        const level1List =
            firstFilter === "home"
                ? handleLevelList(store)
                : data &&
                  data
                      .map((x) => x[level1])
                      .filter(
                          (value, index, self) => self.indexOf(value) === index
                      );

        let level2List = [];
        if (store?.level1) {
            level2List =
                firstFilter === "home"
                    ? handleLevelList(store, store?.level1)
                    : data &&
                      data
                          .filter(
                              (x) =>
                                  x[level1]?.toLowerCase() ===
                                  store.level1?.toLowerCase()
                          )
                          .map((x) => x[level2])
                          .filter(
                              (value, index, self) =>
                                  self.indexOf(value) === index
                          );
        }

        UIStore.update((e) => {
            e.state = {
                ...store.state,
                data: data,
                config: config,
            };
            e.level1List = level1List;
            e.level2List = level2List;
            if (
                e.level2 &&
                !level2List.map((l) => l.toLowerCase()).includes(e.level2)
            ) {
                e.level2 = level2List[0]?.toLowerCase();
            }
        });
    }, [state]);

    return (
        <Layout>
            <Layout className="site-layout">
                <Detail />
            </Layout>
        </Layout>
    );
}

export default Main;
