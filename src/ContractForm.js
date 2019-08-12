import { drizzleConnect } from 'drizzle-react';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

const translateType = type => {
  switch (true) {
    case /^uint/.test(type):
      return 'number';
    case /^string/.test(type) || /^bytes/.test(type):
      return 'text';
    case /^bool/.test(type):
      return 'checkbox';
    default:
      return 'text';
  }
}

class ContractForm extends Component {
  constructor(props, context) {
    super(props);

    const abi = this.contract.abi;

    this.state = {};
    this.inputs = [];
    this.contract = context.drizzle.contracts.StudentElection;

    for (let i = 0; i < abi.length; i++) {
      if (abi[i].name === this.props.method) {
        this.inputs = abi[i].inputs;

        for (let j = 0; j < this.inputs.length; j++) {
          this.state[this.inputs[j].name] = "";
        }

        break;
      }
    }
  }

  handleSubmit(event) {
    const convertedInputs = this.inputs.map(input => {
      if (input.type === "bytes32") {
        return this.utils.toHex(this.state[input.name]);
      }
      return this.state[input.name];
    });

    return this.contract.methods[
      this.props.method
    ].cacheSend(...convertedInputs), {
      from: this.props.account
    }
  }

  handleInputChange(event) {
    let value =
      event.target.type === 'checkbox'
        ? event.target.checked
        : event.target.value;
    if (/^\d+$/.test(value)) { value = parseInt(value); }
    this.setState({ [event.target.name]: value });
  }

  render() {
    return (
      <form className="pure-form pure-form-stacked">
        {this.inputs.map((input, index) => {
          let inputType = this.translateType(input.type);
          let inputLabel = this.props.labels
            ? this.props.labels[index]
            : input.name;
          let rows;

          if (input.name === 'elecKey') {
            let elecChoices = [];

            for (let i = 1; i <= this.props.numOfElections; i++) {
              elecChoices.push(i);
            }
            rows = (
              <div>
                <label >Election Number#</label>
                <select onChange={this.handleInputChange} name="Number_Of_Election">
                  {elecChoices.map(i => {
                    const optionKey = `Election_Number#${i}`;
                    return (
                      <option key={optionKey} value={i}>
                        {i}
                      </option>
                    );
                  })}
                </select>
              </div>
            );
          } else {
            rows = (
              <input
                key={input.name}
                type={inputType}
                name={input.name}
                value={this.state[input.name]}
                placeholder={inputLabel}
                onChange={this.handleInputChange}
              />
            );
          }

          if (inputType === 'checkbox') {
            return (
              <label key="checkbox">
                {inputLabel}:{rows}
              </label>
            );
          } else {
            return rows;
          }
        })}
        <button
          key="submit"
          className="pure-button"
          type="button"
          onClick={this.handleSubmit}>
          Submit
        </button>
      </form>
    );
  }
}

ContractForm.contextTypes = {
  drizzle: PropTypes.object
};

const mapStateToProps = state => {
  return {
    contracts: state.contracts
  };
};

export default drizzleConnect(ContractForm, mapStateToProps);