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
				"Filename": { "type": "string" },
				"Count_rate": { "type": "int" },
				"Whole_count": { "type": "int" },
				"Count_rate_graph": { "type": "trend-graph", "group": [{ "source": "Count_rate", "options": { "legend": "Count_rate" } }], "options": { "xWidth": 200 } },
			}
		},
		{
			"collection": "Scalardata",
			"directory": "Detector",
			"document": "Event",
			"period": "1",
			"section": "Temperature",
			"contents": {
				"Temperature": {
					"type": "int",
				},
				"Temperature-graph": { "type": "trend-graph", "group": [{ "source": "Temperature", "options": { "legend": "Temperature" } }], "options": { "xWidth": 100 } },
			}
		},

		{
			"collection": "Images",
			"directory": "Detector",
			"document": "Event_sumPH",
			"period": "1",
			"section": "PushToQuickLookDB_HistogramXrayEventProperties_sumPH",
			"tableName": "sumPH",
			"contents": {
				"sunPH": { "source": "sumPH", "type": "image" },
			}
		},
		{
			"collection": "Images",
			"directory": "Detector",
			"document": "Event_weight",
			"period": "1",
			"section": "PushToQuickLookDB_HistogramXrayEventProperties_weight",
			"tableName": "Weight",
			"contents": {
				"Weight": { "source": "weight", "type": "image" },
			}
		},
		{
			"collection": "Images",
			"directory": "Detector",
			"document": "Event_ix",
			"period": "1",
			"section": "PushToQuickLookDB_HistogramXrayEventProperties_ix",
			"tableName": "ix",
			"contents": {
				"ix": { "type": "image" },
			}
		},


		{
			"collection": "Images",
			"directory": "Detector",
			"document": "Event_iy",
			"period": "1",
			"section": "PushToQuickLookDB_HistogramXrayEventProperties_iy",
			"tableName": "iy",
			"contents": {
				"iy": { "type": "image" },
			}
		}
	];
