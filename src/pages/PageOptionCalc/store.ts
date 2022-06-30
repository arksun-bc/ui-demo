import { proxy } from 'valtio'
import {
  Fields,
  getDerivativeOptionMeta,
  getOptionPricing,
  ReqOptionPricing,
  ResOptionPricing,
  STRUCTS,
} from '../../api/xalpha'
import { fmtReqOptionPricing, fmtForClient, fmtForTrading } from './helpers'

export { useSnapshot } from 'valtio'

export const SMeta = proxy({
  loading: false,
  structs: STRUCTS as any, // TODO: fix typing
  instruments: [],
  async fetch() {
    SMeta.loading = true
    const { error, data } = await getDerivativeOptionMeta()
    SMeta.loading = false
    if (error) {
      SMeta.structs = []
      SMeta.instruments = []
      return
    }
    SMeta.structs = data.structs
    SMeta.instruments = data.instruments
  },
})

export const SInput = proxy({
  fields: {} as Fields,
  req: [] as ReqOptionPricing[],
  async setReq(fields?: Fields) {
    if (fields) SInput.fields = fields
    SInput.req = fmtReqOptionPricing(fields || SInput.fields)
  },
})

export const S = proxy({
  loading: false,
  res: {} as ResOptionPricing | {},
  client_params: {},
  trading_params: {},
  error: '',
  async fetch() {
    S.loading = true
    // format res
    const { error, data } = await getOptionPricing(SInput.fields.struct, SInput.req)
    S.loading = false
    if (error) {
      S.res = {}
      S.client_params = {}
      S.trading_params = {}
      S.error = error.detail
      return
    }
    S.error = ''
    S.res = data
    const params = fmtForClient(SInput.fields, data.for_client)
    S.client_params = params
    S.trading_params = fmtForTrading(data.for_trading)
  },
})
