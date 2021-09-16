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
    // this.getNullValues = this.getNullValues.bind(this);
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

      this.setState({
        data: data,
        cols: make_cols(ws["!ref"]),
        tempData: data,
        null: nullArray,
        isFileSelected: true,
        name: file.name,
      });
      //  adding the data_type row (array)

      let dataType = [];
      this.state.tempData[1].forEach((element) => {
        console.log(element);
        dataType.push(element ? typeof element : " ");
      });
      this.state.tempData.splice(1, 0, dataType);
      console.log(this.state.tempData);

      this.setState({ data: this.state.tempData });
    };
    if (rABS) reader.readAsBinaryString(file);
    else reader.readAsArrayBuffer(file);
    // this.getNullValues();
  }

  handleChange(e) {
    const files = e.target.files;
    if (files && files[0]) this.handleFile(files[0]);
  }

  ascending() {
    let temp = this.state.data;
    let head = temp[0];
    let dT = temp[1];
    temp = temp.slice(2);
    temp.sort().splice(0, 0, head, dT);
    this.setState({ data: temp });
  }
  descending() {
    let temp = this.state.data;
    let head = temp[0];
    let dT = temp[1];
    temp = temp.slice(2);
    temp.sort().reverse().splice(0, 0, head, dT);
    this.setState({ data: temp });
  }

  onEdit(ind, i, e) {
    this.state.data[ind][i] = e.target.value;
  }

  // getNullValues() {
  //   let col = this.state.data.length;
  //   // let row = this.state.data[0].length;
  //   console.log(this.state.data[0].length);

  //   // console.log(col + row);
  // }

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
          <div className="col-xs-12">
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  {console.log(this.state.data)}
                  <tr>
                    {this.state.cols.map((c) => (
                      <th key={c.key} className="data-item">
                        {c.name}
                        {console.log(this.state.null)}
                      </th>
                    ))}
                  </tr>
                </thead>
                {console.log(this.state.null)}
                <tbody>
                  {this.state.data.map((r, ind) => (
                    <tr
                      key={ind}
                      className={`data-row + + ${
                        ind === 0 ? "heading-item" : ""
                      }`}
                    >
                      {this.state.cols.map((c, i) => (
                        <td
                          key={c.key}
                          className={`data-item ${
                            r[c.key] == null || r[c.key] == ""
                              ? "null-Value"
                              : ""
                          } `}
                        >
                          {this.state.edit ? (
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
