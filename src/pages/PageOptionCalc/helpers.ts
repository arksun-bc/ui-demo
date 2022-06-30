import m from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { omit, isEmpty } from 'lodash'
import { Fields, ReqOptionPricing, ResOptionPricing, STRUCT_READABLE } from '../../api/xalpha'

m.extend(utc)

export function roundNum(n: number, d = 4) {
  return Math.round(n * 10 ** d) / 10 ** d
}
export function calcRatio(n1: number, n2: number) {
  if (n1 < n2) return `1 : ${roundNum(n2 / n1)}`
  return `${roundNum(n1 / n2)} : 1`
}

export function gStartOfDay() {
  return m.utc().valueOf()
}
export function gSelectOpts(list: readonly string[]) {
  return list.map(e => ({ label: e, value: e }))
}

export function fmtExpiry(date: number, hr: number = 0): string {
  return m.utc(date + hr * 3600 * 1000).format('YYYY-MM-DD HH:mm:ss') + ' UTC'
}
export function fmtExpiryInput(date: number): string {
  return m.utc(date).format('DDMMMYY').toUpperCase()
}

export function fmtReqOptionPricing(fields: Fields): ReqOptionPricing[] {
  const { symbol } = fields
  const _fields = omit(fields, ['struct', 'symbol'])
  return Object.values(_fields).map((e: Omit<Fields[number], 'symbol'>) => ({
    symbol,
    ...e,
    expiry: fmtExpiryInput(e.expiry),
  }))
}

/**
 * SECTION   vanilla
 *  Expiry = 2022-07-04 08:00:00 UTC , $1169.0 strike put, ETH Spot ref= $1230.16
    $39.2222/$42.9122 (0.0319/0.0349 ETH), vols = 99.33%/105.33%, delta = -32.92%

 * SECTION   RR
 *  Expiry = 2022-07-04 08:00:00, $1169.0/ $1170.0 Risk reversal (RRput/RRcall), ETH Spot ref= $1230.16
    $39.2222/$42.9122 (0.0319/0.0349 ETH), vols = 99.33%/105.33%
    delta = -32.92%

 * SECTION   spread
    Expiry = 2022-07-04 08:00:00, $1169.0/ $1170.0 strike put spread 1:2 ratio, ETH Spot ref= $1230.16
    $39.2222/$42.9122 (0.0319/0.0349 ETH), vols = 99.33%/105.33%
    moneyness 95%/96%, delta = -32.92%

 * SECTION   straddle
    Expiry = 2022-07-04 08:00:00, $1169.0 strike straddle, ETH Spot ref= $1230.16
    $39.2222/$42.9122 (0.0319/0.0349 ETH), vols = 99.33%/105.33%
    moneyness 95%/96%, delta = -32.92%

 * SECTION   strangle
    Expiry = 2022-07-04 08:00:00, $1169.0/ $1170.0 strike strangle, ETH Spot ref= $1230.16
    $39.2222/$42.9122 (0.0319/0.0349 ETH), vols = 99.33%/105.33%
    moneyness 95%/96%, delta = -32.92%

 */
export const gClientRaw = ({ expiry, strikes, struct, symbol, spot_ref, dollars, natives, vols, deltas }) =>
  `Expiry = ${expiry}, ${strikes} strike ${struct}, ${symbol} Spot ref = ${spot_ref}
${dollars} (${natives}), vols = ${vols}, delta = ${deltas}`

export function fmtForClient(fields: Fields, client: ResOptionPricing['for_client']) {
  if (isEmpty(client)) return {}
  const { struct, spot_ref, bid_dlr, offer_dlr, bid_native, offer_native, vol_bid, vol_offer, delta, expiry } = client
  const symbol = fields.symbol
  const params: any = {
    symbol,
    expiry: fmtExpiry(expiry * 1000),
    spot_ref: '$' + roundNum(spot_ref),
    dollars: `$${roundNum(bid_dlr)} / $${roundNum(offer_dlr)}`,
    natives: `${roundNum(bid_native)} / ${roundNum(offer_native)} ${symbol}`,
    vols: `${roundNum(vol_bid[0], 2)}% / ${roundNum(vol_offer[0], 2)}%`,
    deltas: delta.map(e => roundNum(e * 100, 2)).join('% / ') + '%',
  }
  if (struct === 'VANILLA') {
    params.struct = fields[0].option_type === 'P' ? 'put' : 'call'
    params.strikes = fields[0].strike_type + roundNum(fields[0].strike)
  } else {
    params.struct = STRUCT_READABLE[struct]
    if (struct.endsWith('SPREAD')) params.struct += `${calcRatio(fields[0].notional, fields[1].notional)} ratio`
    params.strikes =
      fields[0].strike_type + roundNum(fields[0].strike) + ' / ' + fields[1].strike_type + roundNum(fields[1].strike)
  }

  return params
}

export function fmtForTrading(trading: ResOptionPricing['for_trading']) {
  if (isEmpty(trading)) return {}
  const {
    moneyness,
    spread_pct_bid,
    spread_pct_offer,
    fwd_yld,
    fwd_price,
    ref_mid_vol,
    vols_days,
    symb_vols,
    ref_vols,
    mid_vol,
    ref_dbt_instrument,
  } = trading
  const params: any = {
    moneyness: moneyness.map(e => roundNum(e, 2)).join('% / ') + '%',
    spreads: `${spread_pct_bid * 100}% / ${spread_pct_offer * 100}%`,
    fwd_ylds: fwd_yld.map(e => roundNum(e)).join(' / '),
    fwd_prices: '$' + fwd_price.map(e => roundNum(e, 2)).join(' / $'),
    instruments: ref_dbt_instrument.join(' / '),
    ref_mid_vols: ref_mid_vol.map(e => roundNum(e * 100, 2)).join('% / ') + '%',
    mid_vols: mid_vol.map(e => roundNum(e * 100, 2)).join('% / ') + '%',

    vols_days: vols_days.join('d / ') + 'd',
    ref_vols: ref_vols.map(e => roundNum(e * 100, 2)).join('% / ') + '%',
    symb_vols: symb_vols.map(e => roundNum(e * 100, 2)).join('% / ') + '%',

    // vol_table_cols: vols_days,
    // vol_table_data: [],
  }
  return params
}
