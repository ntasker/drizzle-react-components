import { drizzleConnect } from 'drizzle-react';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

const stateMap = {
  0: 'Setup',
  1: 'Ongoing',
  2: 'Ended'
};

class ContractData extends Component {
  constructor(props, context) {
    super(props);

    this.method =
      context.drizzle.contracts[this.props.contract].methods[this.props.method];
    let methodArgs = this.props.methodArgs ? this.props.methodArgs : [];
    this.state = { dataKey: this.method.cacheCall(...methodArgs) };
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.methodArgs &&
      JSON.stringify(this.props.methodArgs) !==
        JSON.stringify(prevProps.methodArgs)
    ) {
      this.setState({
        dataKey: this.method.cacheCall(...this.props.methodArgs)
      });
    }
  }

  render() {
    // Contract is not yet intialized.
    if (!this.props.contracts[this.props.contract].initialized) {
      return <span>Initializing...</span>;
    }

    // If the cache key we received earlier isn't in the store yet; the initial value is still being fetched.
    if (
      !(
        this.state.dataKey in
        this.props.contracts[this.props.contract][this.props.method]
      )
    ) {
      return <span>Fetching...</span>;
    }

    // Show a loading spinner for future updates.
    let pendingSpinner = this.props.contracts[this.props.contract].synced
      ? ''
      : ' 🔄';

    // Optionally hide loading spinner (EX: ERC20 token symbol).
    if (this.props.hideIndicator) {
      pendingSpinner = '';
    }

    let displayData = this.props.contracts[this.props.contract][
      this.props.method
    ][this.state.dataKey].value;

    if (this.props.method === 'getStateOfElection') {
      displayData = stateMap[displayData];
    }

    // Optionally convert to UTF8
    if (this.props.toUtf8) {
      displayData = this.context.drizzle.web3.utils.hexToUtf8(displayData);
    }

    // Optionally convert to Ascii
    if (this.props.toAscii) {
      displayData = this.context.drizzle.web3.utils.hexToAscii(displayData);
    }

    // If return value is an array
    if (Array.isArray(displayData)) {
      const displayListItems = displayData.map((datum, index) => {
        return (
          <li key={index}>
            {`${datum}`}
            {pendingSpinner}
          </li>
        );
      });

      return <ul>{displayListItems}</ul>;
    }

    // If retun value is an object
    if (typeof displayData === 'object' && displayData !== null) {
      let i = 0;
      const displayObjectProps = [];

      Object.keys(displayData).forEach(key => {
        if (i !== key) {
          displayObjectProps.push(
            <li key={i}>
              <strong>{key}</strong>
              {pendingSpinner}
              <br />
              {`${displayData[key]}`}
            </li>
          );
        }

        i++;
      });

      return <ul>{displayObjectProps}</ul>;
    }

    return (
      <span>
        {`${displayData}`}
        {pendingSpinner}
      </span>
    );
  }
}

ContractData.contextTypes = {
  drizzle: PropTypes.object
};

/*
 * Export connected component.
 */

const mapStateToProps = state => {
  return {
    contracts: state.contracts
  };
};

export default drizzleConnect(ContractData, mapStateToProps);