import React from "react";
import ReactDOM from "react-dom";
import Main from "./Main";

import "./root.css";

if (document.getElementById("root")) {
    ReactDOM.render(<Main />, document.getElementById("root"));
}
