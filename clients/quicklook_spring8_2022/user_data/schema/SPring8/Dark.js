HSQuickLook.main.schema =
	[
		{
			"collection": "Scalardata",
			"directory": "Detector",
			"document": "Dark",
			"period": "1",
			"section": "Metadata",
			"contents": {
				"Loop_counter": { "type": "int" },
				"Capture_time": { "type": "string" },
				"Filename": { "type": "string" }
			}
		},
		{
			"collection": "Images",
			"directory": "Detector",
			"document": "frame_pedestal",
			"period": "1",
			"section": "PushToQuickLookDB_HistogramFramePedestal",
			"tableName": "frame_pedestal",
			"contents": {
				"frame_pedestal": {
					"type": "image"
				}
			}


		},
		{
			"collection": "Images",
			"directory": "Detector",
			"document": "raw_frame_image",
			"period": "1",
			"section": "PushToQuickLookDB_HistogramRawFrameImage",
			"tableName": "HistogramRawFrameImage",
			"contents": {
				"raw_frame_image": {
					"type": "image"
				}
			}


		}
	];
