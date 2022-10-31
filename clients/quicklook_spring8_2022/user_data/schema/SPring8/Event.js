HSQuickLook.main.schema =
	[
		{
			"collection": "SPring8_2022",
			"directory": "Detector",
			"document": "Event",
			"period": "1",
			"section": "Metadata",
			"contents": {
				"Loop_counter": { "type": "int" },
				"Capture_time": { "type": "string" },
				"Filename": { "type": "string" },
				"Count_rate": { "type": "int" },
				"Whole_count": { "type": "int" }
			}
		},
		{
			"collection": "SPring8_2022",
			"directory": "Detector",
			"document": "Event",
			"period": "1",
			"section": "Temperature",
			"contents": {
				"Temperature": { "type": "int" },
				"Temperature-graph": { "type": "trend-graph", "group": [{ "source": "Temperature", "options": { "legend": "Temperature" } }], "options": { "xWidth": 100, "ywidth": 20, } },
			}
		}
	];
