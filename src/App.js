import React from "react";
import XLSX from "xlsx";
import "./App.css";
import DragDropFile from "./component/dragAndDrop";

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      cols: [],
    };

    this.handleFile = this.handleFile.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleFile(file) {
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    reader.onload = (e) => {
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, { type: rABS ? "binary" : "array" });

      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];

      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      this.setState({ data: data, cols: make_cols(ws["!ref"]) });
    };
    if (rABS) reader.readAsBinaryString(file);
    else reader.readAsArrayBuffer(file);
  }

  handleChange(e) {
    const files = e.target.files;
    if (files && files[0]) this.handleFile(files[0]);
  }

  render() {
    return (
      <DragDropFile handleFile={this.handleFile}>
        <div className="row data-input-container">
          <form className="form-inline">
            <div className="form-group">
              <label htmlFor="file" className="custom-file-upload">
                Upload File
              </label>
              <input
                type="file"
                className="form-control input-button"
                id="file"
                accept={SheetJSFT}
                onChange={this.handleChange}
              />
            </div>
          </form>
        </div>

        <div className="row">
          <div className="col-xs-12">
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    {this.state.cols.map((c) => (
                      <th key={c.key}>{c.name}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {this.state.data.map((r, i) => (
                    <tr
                      key={i}
                      className={`data-row + + ${
                        i === 0 ? "heading-item" : ""
                      }`}
                    >
                      {/* {console.log(r)} */}
                      {this.state.cols.map((c, i) => (
                        <td
                          key={c.key}
                          className={`data-item ${
                            r[c.key] == null ? "null-Value" : ""
                          } `}
                        >
                          {console.log(c)}
                          {r[c.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DragDropFile>
    );
  }
}

const SheetJSFT = ["xlsx", "xls", "csv"]
  .map(function (x) {
    return "." + x;
  })
  .join(",");

const make_cols = (refstr) => {
  let o = [],
    C = XLSX.utils.decode_range(refstr).e.c + 1;

  for (var i = 0; i < C; ++i) o[i] = { name: XLSX.utils.encode_col(i), key: i };

  return o;
};
