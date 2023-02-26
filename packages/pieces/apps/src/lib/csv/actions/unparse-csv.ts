import { createAction, Property } from "@activepieces/framework";
import { UnparseConfig } from "papaparse";
import { unparseCSVObject } from "../utils";

export const unparseCSVTextAction = createAction({
  name: 'unparse_csv_text',
  displayName: 'Unparse JSON Text',
  description: 'Read JSON and automatically parse it into a CSV:',
  sampleData: [
    "Column 1,Column 2,Column 3,Column 4",
    "1-1,1-2,1-3,1-4"
  ],
  props: {
    csv_object: Property.Json({
      displayName: 'CSV JSON',
      defaultValue: {},
      required: true
    }),
    has_headers: Property.Checkbox({
      displayName: 'CSV contains headers',
      defaultValue: false,
      required: true,
    }),
    delimiter_type: Property.StaticDropdown({
      displayName: 'Delimeter Type',
      description: 'Will try to guess the delimeter',
      defaultValue: '',
      required: true,
      options: {
        options: [
          { label: "Auto", value: "auto" },
          { label: "Comma", value: "," },
          { label: "Tab", value: "\t" }
        ]
      }
    }),
  },
  async run(context) {
    const { csv_object, has_headers, delimiter_type } = context.propsValue
    const config: UnparseConfig = {
      header: has_headers,
      delimiter: delimiter_type === "auto" ? "" : delimiter_type,
      skipEmptyLines: true
    }

    const results = unparseCSVObject(csv_object, config)
    console.debug("Unparse results", results)

    return results
  }
});
