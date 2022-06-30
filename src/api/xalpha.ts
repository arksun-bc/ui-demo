/* eslint-disable camelcase */
import axios from 'axios'
import { gBaseUrlXalpha, gRequest } from './base'

const client = axios.create({
  baseURL: gBaseUrlXalpha(),
})

const request = gRequest(client)

export type Res<T> = Promise<{
  data?: T
  error?: any
}>
// SECTION for option start

export const STRUCTS = ['VANILLA', 'CALL_RR', 'CALL_SPREAD', 'PUT_RR', 'PUT_SPREAD', 'STRADDLE', 'STRANGLE'] as const

export const STRUCT_READABLE = {
  CALL_RR: 'risk reversal call',
  PUT_RR: 'risk reversal put',
  CALL_SPREAD: 'call spread',
  PUT_SPREAD: 'put spread',
  STRADDLE: 'straddle',
  STRANGLE: 'strangle',
}

export type Struct = typeof STRUCTS[number]

export type ReqOptionPricing = {
  symbol: string
  strike: number
  option_type: 'P' | 'C'
  strike_type: '$' // TODO: from phase 2 can be quote coin
  notional_type: '$' | 'x'
  notional: number
  spread_pct_bid: number
  spread_pct_offer: number
  manual_bid_vol: number // -> Manual Bid Volatility
  manual_offer_vol: number // -> Manual Offer Volatility
  expiry: string // format('DDMMMYY').toUpperCase(), e.g. '29JUL22'
  expiry_hour_utc: number
}
export type Fields = {
  struct: Struct
  symbol: string
  [idx: number]: Omit<ReqOptionPricing, 'symbol'> & {
    expiry: number
  }
}

export const REQ_TABLE_HEADER = [
  // 'Strike Type', = '$' in phase 1
  'Strike',
  'Notional',
  'Spread Bid / Offer',
  'Manual Vol Bid / Offer',
  'Expiry Date',
  'Hour (UTC)',
]

// NOTE: if support multiple vanilla, break change may occur
export type ResOptionPricing = {
  for_client: {
    struct: Struct
    option_instrument: string
    spot_ref: number // price
    delta: number[] // percentage
    bid_dlr: number // dollar
    offer_dlr: number
    bid_native: number // Bid Native
    offer_native: number // Offer Native
    vol_bid: number[] // percentage of P / C / Both, 1~2 results
    vol_offer: number[] // as above
    expiry: number // = ReqOptionPricing expiry + expiry_hour_utc
  }
  for_trading: {
    moneyness: number[] // as vol_offer, strike price against the spot price
    spread_pct_bid: number
    spread_pct_offer: number
    fwd_yld: number[] // 1~2 results
    fwd_price: number[] // as above
    ref_mid_vol: number[] // as above
    vols_days: number[] // -> Volatility Days, 4 results, [10,30,180,365]
    symb_vols: number[] // 4 results
    ref_vols: number[] // 4 results
    mid_vol: number[] // 4 results
    ref_dbt_instrument: string[] // -> Reference Deribit Instrument, P / C / Both
  }
}

export const getDerivativeOptionMeta = (): Res<{ structs: Struct[]; instruments: string[] }> =>
  request({
    url: 'xalpha_api/derivative/option/meta',
  })
    .then(data => ({ data }))
    .catch(error => ({ error }))

export const getOptionPricing = (struct: Struct, data: ReqOptionPricing[]): Res<ResOptionPricing> =>
  request({
    method: 'POST',
    url: 'xalpha_api/derivative/options/pricing/' + struct,
    data,
  })
    .then(data => ({ data }))
    .catch(error => ({ error }))
