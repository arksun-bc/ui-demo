import React, { useEffect, useState } from 'react'
import { Form, Button, DatePicker, Select, Input, InputNumber } from 'antd'
// import { get } from 'lodash'
import { S, SInput, SMeta, useSnapshot } from '../store'
import { REQ_TABLE_HEADER, STRUCTS } from '../../../api/xalpha'
import { gSelectOpts } from '../helpers'

const precision = 4
const defaultRecordValues = {
  option_type: 'P', // or 'C', sometimes disabled
  strike: 1,
  strike_type: '$', // TODO from phase 2 can be quote coin
  notional: 1,
  notional_type: '$', // or 'x'
  spread_pct_bid: 3,
  spread_pct_offer: 3,
  manual_bid_vol: 0, // -> Manual Bid Volatility
  manual_offer_vol: 0, // -> Manual Offer Volatility
  expiry: undefined, // format('DDMMMYY').toUpperCase(), e.g. '29JUL22'
  expiry_hour_utc: 8,
}

const initialValues = {
  struct: STRUCTS[0],
  symbol: 'BTC',
  0: defaultRecordValues,
  1: defaultRecordValues,
}
const offset = new Date().getTimezoneOffset()

const OptionPricingForm: React.FC = () => {
  const { loading } = useSnapshot(S)
  const { loading: loadingMeta, structs, instruments } = useSnapshot(SMeta)
  const [form] = Form.useForm()
  const struct = Form.useWatch('struct', form)
  const records = struct === 'VANILLA' ? [0] : [0, 1]
  const [disableType, setDisableType] = useState(false)

  useEffect(() => {
    SMeta.fetch()
  }, [])

  // NOTE handle diff struct option type
  useEffect(() => {
    if (struct === 'CALL_RR') {
      form.setFields([
        { name: [0, 'option_type'], value: 'C' },
        { name: [1, 'option_type'], value: 'P' },
      ])
      setDisableType(true)
    } else if (struct === 'PUT_RR') {
      form.setFields([
        { name: [0, 'option_type'], value: 'P' },
        { name: [1, 'option_type'], value: 'C' },
      ])
      setDisableType(true)
    } else setDisableType(false)
  }, [struct])
  function onReset() {
    form.setFieldsValue(initialValues)
  }
  async function onFinish(values) {
    // TODO may need validation & optimization
    const _values = { ...values }
    _values[0].expiry = (values[0].expiry as any).subtract(offset, 'm').valueOf()
    _values[0].spread_pct_bid = values[0].spread_pct_bid / 100
    _values[0].spread_pct_offer = values[0].spread_pct_offer / 100
    if (values[1]) {
      _values[1].expiry = (values[1].expiry as any).subtract(offset, 'm').valueOf()
      _values[1].spread_pct_bid = values[1].spread_pct_bid / 100
      _values[1].spread_pct_offer = values[1].spread_pct_offer / 100
    }
    SInput.setReq(_values)
    S.fetch()
  }
  return (
    <div className="p-4 mx-auto rounded-md shadow-lg border-1 max-w-7xl bg-sky-50">
      <h1>INPUT (status: {loadingMeta ? 'Loading Metadata' : loading ? 'Loading Result' : 'Standby'})</h1>
      <Form
        className="w-full"
        layout="inline"
        name="option_calculator"
        form={form}
        disabled={loadingMeta}
        initialValues={initialValues}
        onFinish={onFinish}
      >
        <Form.Item label="Struct" name="struct" className="!w-1/4">
          <Select disabled={loadingMeta} options={gSelectOpts(structs)} showSearch />
        </Form.Item>
        <Form.Item label="Symbol" name="symbol" className="!w-1/4">
          <Select disabled={loadingMeta} showSearch options={gSelectOpts(instruments)} />
        </Form.Item>
        <div className="w-full my-2">
          <table className="divide divide-slate-200">
            <thead>
              <tr>
                {REQ_TABLE_HEADER.map((e, i) => (
                  <th key={e}>{e}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map(e => (
                <tr key={e}>
                  <td>
                    <Form.Item name={[e, 'strike']}>
                      <InputNumber
                        size="small"
                        controls={false}
                        placeholder="number"
                        precision={precision}
                        min={0}
                        addonBefore={
                          <Form.Item name={[e, 'option_type']} noStyle>
                            <Select
                              disabled={disableType}
                              size="small"
                              bordered={false}
                              options={gSelectOpts(['P', 'C'])}
                            />
                          </Form.Item>
                        }
                      />
                    </Form.Item>
                    <Form.Item name={[e, 'strike_type']} hidden>
                      <Input value="$" />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item name={[e, 'notional']}>
                      <InputNumber
                        size="small"
                        controls={false}
                        placeholder="number"
                        precision={precision}
                        min={0}
                        addonBefore={
                          <Form.Item name={[e, 'notional_type']} noStyle>
                            <Select options={gSelectOpts(['$', 'x'])} />
                          </Form.Item>
                        }
                      />
                    </Form.Item>
                  </td>
                  <td className="pr-4 text-center">
                    <Input.Group compact className="pr-4">
                      <Form.Item name={[e, 'spread_pct_bid']} noStyle>
                        <InputNumber
                          className="w-24"
                          size="small"
                          controls={false}
                          min={0}
                          max={100}
                          placeholder="number"
                          addonAfter={'%'}
                        />
                      </Form.Item>
                      <Form.Item noStyle>
                        <Input
                          className="md:!hidden xl:!inline antd-input-split"
                          tabIndex={-1}
                          size="small"
                          bordered={false}
                          style={{
                            width: 30,
                            borderLeft: 0,
                            borderRight: 0,
                            pointerEvents: 'none',
                          }}
                          placeholder="/"
                          disabled
                        />
                      </Form.Item>
                      <Form.Item name={[e, 'spread_pct_offer']} noStyle>
                        <InputNumber
                          className="w-24"
                          size="small"
                          controls={false}
                          min={0}
                          max={100}
                          placeholder="number"
                          addonAfter={'%'}
                        />
                      </Form.Item>
                    </Input.Group>
                  </td>
                  <td className="pr-4">
                    <Input.Group compact>
                      <Form.Item name={[e, 'manual_bid_vol']} noStyle>
                        <InputNumber
                          className="w-24"
                          size="small"
                          controls={false}
                          min={0}
                          max={100}
                          placeholder="number"
                          addonAfter={'%'}
                        />
                      </Form.Item>
                      <Form.Item noStyle>
                        <Input
                          className="md:!hidden xl:!inline antd-input-split"
                          tabIndex={-1}
                          size="small"
                          bordered={false}
                          style={{
                            width: 30,
                            borderLeft: 0,
                            borderRight: 0,
                            pointerEvents: 'none',
                          }}
                          placeholder="/"
                          disabled
                        />
                      </Form.Item>
                      <Form.Item name={[e, 'manual_offer_vol']} noStyle>
                        <InputNumber
                          className="w-24"
                          size="small"
                          controls={false}
                          min={0}
                          max={100}
                          placeholder="number"
                          addonAfter={'%'}
                        />
                      </Form.Item>
                    </Input.Group>
                  </td>
                  <td>
                    <Form.Item name={[e, 'expiry']} rules={[{ required: true, message: 'Expiry Date is required' }]}>
                      <DatePicker size="small" picker="date" className="w-40" />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item name={[e, 'expiry_hour_utc']}>
                      <InputNumber size="small" min={0} max={24} controls={false} type="number" className="!w-20" />
                    </Form.Item>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="w-full pb-4 mb-4 border-b" />
        <div className="flex justify-end w-full">
          <Form.Item>
            <Button disabled={loading} onClick={() => onReset()}>
              Reset
            </Button>
          </Form.Item>
          <Form.Item>
            <Button disabled={loading} type="primary" htmlType="submit" loading={loading}>
              Submit
            </Button>
          </Form.Item>
        </div>
      </Form>
    </div>
  )
}

export default OptionPricingForm
