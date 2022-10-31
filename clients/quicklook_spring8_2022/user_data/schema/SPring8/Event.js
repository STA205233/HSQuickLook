HSQuickLook.main.schema =
	[
		{
			"collection": "Scalardata",
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
			"collection": "Scalardata",
			"directory": "Detector",
			"document": "Event",
			"period": "1",
			"section": "Temperature",
			"contents": {
				"Temperature": { "type": "int" },
				"Temperature-graph": { "type": "trend-graph", "group": [{ "source": "Temperature", "options": { "legend": "Temperature" } }], "options": { "xWidth": 100, "ywidth": 20, } },
			}
		},
		{
			"collection": "Images",
			"directory": "Detector",
			"document": "Event_weight",
			"period": "1",
			"section": "PushToQuickLookDB_HistogramXrayEventProperties_weight",
			"contents": {
				"weight": { "type": "image" }
			}
		},
		{
			"collection": "Images",
			"directory": "Detector",
			"document": "Event_sumPH",
			"period": "1",
			"section": "PushToQuickLookDB_HistogramXrayEventProperties_sumPH",
			"contents": {
				"sumPH": { "type": "image" }
			}
		},
		{
			"collection": "Images",
			"directory": "Detector",
			"document": "Event_pixel",
			"period": 1,
			"section": "PushToQuickLookDB_HistogramXrayEventProperties_pixels",
			"contents": {
				"ix": { "type": "image" },
				"iy": { "type": "image" }
			}

		}
	];
