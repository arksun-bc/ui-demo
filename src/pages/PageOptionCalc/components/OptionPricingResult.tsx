import React from 'react'
import { Card, Typography, Statistic, Row, Col, Empty, Result } from 'antd'
import { isEmpty } from 'lodash'
import { S, useSnapshot } from '../store'
import { ResOptionPricing } from '../../../api/xalpha'
import { gClientRaw } from '../helpers'

const { Text } = Typography
const headStyle = {
  backgroundColor: '#eee',
}

const Raw = ({ data }: { data: any }) => {
  const text = isEmpty(data) ? '' : gClientRaw(data)
  const copyable = { text }

  return <Text copyable={copyable}></Text>
}

const OptionPricingResult: React.FC = () => {
  const { loading, res, client_params, trading_params, error } = useSnapshot(S)
  if (error) return <Result status="error" title="Invalid Input" subTitle={error} />
  if (isEmpty(res) && !loading) return <Empty description="No data" />
  const { for_client: c } = res as ResOptionPricing
  const cp = client_params as any
  const tp = trading_params as any
  return (
    <>
      <Card title="EXTERNAL" extra={<Raw data={client_params} />} loading={loading} hoverable headStyle={headStyle}>
        {!loading && (
          <Row gutter={8}>
            <Col span={16}>
              <Statistic title="Instrument" value={c.option_instrument} />
            </Col>
            <Col span={8}>
              <Statistic title="Expiry" value={cp.expiry} />
            </Col>
            <Col span={6}>
              <Statistic title="Structure" value={cp.struct} />
            </Col>
            <Col span={6}>
              <Statistic title="Strike" value={cp.strikes} />
            </Col>
            <Col span={6}>
              <Statistic title="Spot Ref" value={cp.spot_ref} />
            </Col>
            <Col span={6}>
              <Statistic title="Bid / Offer Dollar" value={cp.dollars} />
            </Col>
            <Col span={6}>
              <Statistic title="Bid / Offer Native" value={cp.natives} />
            </Col>
            <Col span={6}>
              <Statistic title="Bid / Offer Volatility" value={cp.vols} />
            </Col>
            <Col span={6}>
              <Statistic title="Delta" value={cp.deltas} />
            </Col>
          </Row>
        )}
      </Card>
      <br />
      <Card title="INTERNAL" loading={loading} hoverable headStyle={headStyle}>
        {!loading && (
          <Row gutter={8}>
            <Col span={16}>
              <Statistic title="Ref Deribit Instrument" value={tp.instruments} />
            </Col>
            <Col span={8}>
              <Statistic title="Moneyness" value={tp.moneyness} />
            </Col>
            <Col span={6}>
              <Statistic title="Bid / Offer Spreads" value={tp.spreads} />
            </Col>
            <Col span={6}>
              <Statistic title="Forward Yields" value={tp.fwd_ylds} />
            </Col>
            <Col span={6}>
              <Statistic title="Forward Prices" value={tp.fwd_prices} />
            </Col>
            <Col span={6}>
              <Statistic title="Ref Middle Volatilities" value={tp.ref_mid_vols} />
            </Col>
            <Col span={6}>
              <Statistic title="Middle Volatilities" value={tp.ref_mid_vols} />
            </Col>
            <Col span={18}></Col>
            {/* <Col span={12}>
              <Statistic title="Volatilities Days" value={tp.vols_days} />
            </Col> */}
            <Col span={12}>
              <Statistic title="Symbol Volatilities" value={tp.symb_vols} />
            </Col>
            <Col span={12}>
              <Statistic title="Ref Volatilities" value={tp.ref_vols} />
            </Col>
          </Row>
        )}
      </Card>
    </>
  )
}

export default OptionPricingResult
