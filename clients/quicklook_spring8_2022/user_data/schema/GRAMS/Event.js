HSQuickLook.main.schema =
    [
        {
            "collection": "GL840",
            "directory": "GL840",
            "document": "GL840",
            "period": "1",
            "section": "GL840",
            "contents": {
                "Time": { "type": "string" },
                "APR262": { "type": "float" },
                "MPT200": {
                    "type": "float", "source": "Pressure_2", "conversion": function (v) {
                        v = Number(v)
                        v = v.toFixed(3)
                        v = String(v)
                        v = v + " hPa"
                        return v
                    }
                },
                "MPT200_graph": { "type": "trend-graph", "group": [{ "source": "Pressure_2" }] },
                "Temperature": { "type": "float" },
            }
        },]