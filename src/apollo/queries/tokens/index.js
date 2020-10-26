import { getLatestPrices, getOwnersERC20Tokens } from './tokens.graphql';
import ethImg from '@/assets/images/networks/eth.svg';
import { Toast, ERROR } from '@/components/toast';

const ETH_ID = 'ethereum';
export default class Tokenslist {
  constructor(apollo) {
    this.apollo = apollo;
  }
  getLatestPrices() {
    return this.apollo
      .query({
        query: getLatestPrices,
        fetchPolicy: 'cache-first'
      })
      .then(response => {
        if (response && response.data) {
          this.tokensData = new Map();
          response.data.getLatestPrices.forEach(token => {
            if (token.id === ETH_ID || token.contract) {
              this.tokensData.set(
                token.contract ? token.contract.toLowerCase() : ETH_ID,
                token
              );
            }
          });
        }
        return this.tokensData;
      })
      .catch(error => {
        Toast(error.message, {}, ERROR);

        throw error;
      });
  }
  getOwnersERC20Tokens(hash) {
    if (!this.tokensData || this.tokensData.length === 0) {
      this.getLatestPrices();
    }
    return this.apollo
      .query({
        query: getOwnersERC20Tokens,
        variables: {
          hash: hash
        }
      })
      .then(response => {
        if (response && response.data) {
          return this.formatOwnersERC20Tokens(
            response.data.getOwnersERC20Tokens.owners
          );
        }
      })
      .catch(error => {
        Toast(error.message, {}, ERROR);

        throw error;
      });
  }
  formatOwnersERC20Tokens(tokens) {
    const formattedList = [];
    const eth = this.tokensData.get(ETH_ID);
    tokens.forEach(token => {
      let foundToken;
      if (this.tokensData) {
        foundToken = this.tokensData.get(
          token.tokenInfo.contract.toLowerCase()
        );
      }
      // need to eventually change image to check tokens network rather than just use eth network (if theres no image from coingecko)
      formattedList.push({
        name: token.tokenInfo.symbol,
        symbol: token.tokenInfo.symbol,
        subtext: token.tokenInfo.name,
        value: token.tokenInfo.name,
        balance: token.balance,
        contract: token.tokenInfo.contract,
        img: foundToken ? foundToken.image : ethImg,
        decimals: token.tokenInfo.decimals
      });
    });
    formattedList.unshift({
      name: eth.symbol,
      symbol: eth.symbol,
      subtext: eth.name,
      value: eth.name,
      balance: eth.balance,
      img: eth.image
    });
    return formattedList;
  }
}