/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const {
    override,
    adjustWorkbox
} = require("customize-cra");

module.exports = override(
    // adjust the underlying workbox
    adjustWorkbox(wb =>
        Object.assign(wb, {
            skipWaiting: false,
            importWorkboxFrom: 'local'
        })
    )
);
