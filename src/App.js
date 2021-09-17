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
      tempData: [],
      isFileSelected: false,
      name: undefined,
      edit: false,
      null: [],
    };

    this.handleFile = this.handleFile.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.ascending = this.ascending.bind(this);
    this.descending = this.descending.bind(this);
    this.onEdit = this.onEdit.bind(this);
    this.nullValue = this.nullValue.bind(this);
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
      var nullArray = new Array(make_cols(ws["!ref"]).length).fill(0);
      let dataType = [];
      this.setState({
        data: data,
        cols: make_cols(ws["!ref"]),
        tempData: data,
        null: nullArray,
        isFileSelected: true,
        name: file.name,
        searchWord: "",
      });
      this.state.tempData[2].forEach((element) => {
        dataType.push(element ? typeof element : " ");
      });

      this.state.tempData.splice(1, 0, dataType, this.state.null);
      this.setState({ data: this.state.tempData });
      this.nullValue();
    };
    if (rABS) reader.readAsBinaryString(file);
    else reader.readAsArrayBuffer(file);
  }

  handleChange(e) {
    const files = e.target.files;
    if (files && files[0]) this.handleFile(files[0]);
  }

  ascending() {
    let temp = this.state.data;
    let head = temp[0];
    let dT = temp[1];
    let nul = temp[2];
    temp = temp.slice(3);
    temp.sort().splice(0, 0, head, dT, nul);
    this.setState({ data: temp });
  }
  descending() {
    let temp = this.state.data;
    let head = temp[0];
    let dT = temp[1];
    let nul = temp[2];
    temp = temp.slice(3);
    temp.sort().reverse().splice(0, 0, head, dT, nul);
    this.setState({ data: temp });
  }

  onEdit(ind, i, e) {
    let temp = this.state.data;
    temp[ind][i] = e.target.value;
    this.setState({ data: temp });
  }

  nullValue() {
    var nullArray = new Array(this.state.cols.length).fill(0);
    this.state.cols.forEach((c, i) =>
      this.state.data.forEach((r, ind) => {
        if (r[c.key] === undefined || r[c.key] === "" || r[c.key] == null) {
          let temp = nullArray;
          temp[i]++;
          this.setState({ null: nullArray });
        }
      })
    );

    let temp = this.state.null;
    temp.forEach((v, i) => {
      temp[i] = temp[i] + " Null Values";
    });
    this.setState({ null: temp });
    this.state.tempData.splice(2, 1, this.state.null);
    this.setState({ data: this.state.tempData });
  }

  render() {
    return (
      <DragDropFile handleFile={this.handleFile}>
        <div className="row data-input-container">
          <div className="project-title tooltip">
            𝙳𝚘𝚙𝚎𝚛𝚊𝚝𝚘𝚛
            <span className="tooltiptext">𝙼𝚊𝚍𝚎 𝚋𝚢 𝙰𝚛𝚜𝚑𝚊𝚗𝚜𝚑</span>
          </div>
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
            <label>
              {this.state.name ? this.state.name : "Drag and Drop/ Upload File"}
            </label>
          </form>
          <div className="functional-btn-container">
            {this.state.isFileSelected ? (
              <>
                <button onClick={this.ascending} className="functional-btn">
                  Ascending Order
                </button>

                <button
                  onClick={() => this.setState({ data: this.state.tempData })}
                  className="functional-btn"
                >
                  Original Order
                </button>
                <button onClick={this.descending} className="functional-btn">
                  Descending Order
                </button>
                <button
                  onClick={() => this.setState({ edit: !this.state.edit })}
                  className="functional-btn"
                >
                  {this.state.edit ? "Normal Mode" : "Edit Mode"}
                </button>
              </>
            ) : undefined}
          </div>
        </div>

        <div className="row table-container">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  {this.state.cols.map((c) => (
                    <th key={c.key} className="data-item">
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {this.state.data.map((r, ind) => (
                  <tr
                    key={ind}
                    className={`data-row + ${ind === 0 ? "heading-item" : ""} `}
                  >
                    {this.state.cols.map((c, i) => (
                      <td
                        key={c.key}
                        className={`data-item ${
                          r[c.key] === undefined || r[c.key] === ""
                            ? "null-Value"
                            : ""
                        } `}
                      >
                        {this.state.edit && ind !== 2 ? (
                          <input
                            type="text"
                            className="editable-cell"
                            defaultValue={r[c.key]}
                            onChange={(evt) => this.onEdit(ind, i, evt)}
                          />
                        ) : (
                          <div>{r[c.key]}</div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
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
