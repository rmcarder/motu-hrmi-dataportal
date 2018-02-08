import React from 'react'
import PropTypes from 'prop-types'
import SubTopNav from '../SubTopNav/'
import CountryItem from './CountryItem'
import BarChartESR from '../BarChartESR/'
import BarChartCPR from '../BarChartCPR/'
import CountryRightsChart from 'components/CountryRightsChart'
import QuestionTooltip from '../QuestionTooltip'
import DownloadPopup from '../DownloadPopup'
import ChangeStandard from '../ChangeStandard'
import { segsToUrl, getRegionName } from '../utils'
import styles from './style.css'
import rightsDefinitions from '../../data/rights-definitions.json'

export default class CountryPage extends React.Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    urlSegs: PropTypes.object.isRequired,
    urlPush: PropTypes.func.isRequired,
    esrStandard: PropTypes.string.isRequired,
    content: PropTypes.object.isRequired,
  }

  constructor() {
    super()
    this.state = {
      currRight: 'freedom-from-arbitrary-arrest',
      showMore: false,
    }
  }

  setExploreBy = (right) => {
    const { urlSegs } = this.props
    this.props.urlPush(segsToUrl({ ...urlSegs, exploreBy: 'Rights', right: this.state.currRight, country: undefined }))
  }

  setCountry = (country) => {
    this.props.urlPush(segsToUrl({ ...this.props.urlSegs, country: country }))
  }

  resetCountry = () => {
    this.props.urlPush(segsToUrl({ ...this.props.urlSegs, country: undefined, right: 'all' }))
  }

  setCurrRight = (right) => {
    if (right !== this.state.currRight) {
      this.setState({ currRight: right })
    } else {
      this.setState({ currRight: 'all' })
    }
  }

  toggleShowMore = () => {
    this.setState({ showMore: !this.state.showMore })
  }

  render() {
    const { data: { rightsByRegion }, urlSegs, esrStandard, content } = this.props
    const { currRight, showMore } = this.state
    const countries = rightsByRegion[urlSegs.region].countries
    const currCountry = countries.find(country => country.countryCode === urlSegs.country)

    const rights = Object.entries(rightsDefinitions).map(([code, right]) => ({ code, ...right }))
    const ESRs = rights.filter(right => right.type === 'ESR')
    const CPRs = rights.filter(right => right.type === 'CPR')
    const isESRSelected = ESRs.some(r => r.code === currRight)
    const isCPRSelected = CPRs.some(r => r.code === currRight)

    return (
      <div className={styles.countryPage}>
        <SubTopNav />
        <div className='row'>
          <div className='column'>
            <div className={styles.backBtn} onClick={this.resetCountry}>
              <div className={styles.hintText}>BACK TO</div>
              <div className={styles.backLink}>
                {getRegionName(urlSegs.region)}
              </div>
            </div>
            <div className={styles.countriesListWrapper}>
              <ul className={styles.countriesList}>
                {countries.map((country) => (
                  <CountryItem key={country.countryCode} code={country.countryCode} onItemClick={this.setCountry} selected={country.countryCode === urlSegs.country}>
                    {country.countryCode}
                  </CountryItem>
                ))}
              </ul>
            </div>
          </div>

          <div className='column'>
            <div className={styles.countryHeader}>
              <ChangeStandard />
            </div>
            <div className={styles.countryChart}>
              <CountryRightsChart
                rights={currCountry.rights}
                esrStandard={esrStandard}
                size={800}
                margin={200}
                displayLabels
              />
            </div>
            <div className={styles.countryFooter}>
              <div className={styles.downloadPopupWrapper}><DownloadPopup itemList={['chart']} /></div>
              <div className={styles.text}>Each axis represents a right. The further the score is along each axis, the better the country’s performance on that right.</div>
              <div className={styles.source}><small className={styles.small}>SOURCE:</small> 2018 Human Rights Measurement Initiative (HRMI) DATASET, <a className={styles.small} href='https://humanrightsmeasurement.org'>https://humanrightsmeasurement.org</a></div>
            </div>
          </div>

          <div className='column'>
            <div className={styles.columnRight}>
              <div className={styles.countryInfo}>
                <div className={styles.detailCountry}>{currCountry.countryCode}</div>
                <div className={styles.smallTitle}>POPULATION (2015)</div>
                <div className={styles.smallText2}>{currCountry.population} million</div>
                <div className={styles.smallTitle}>GDP/CAPITA (2015)</div>
                <div className={styles.smallText2}>${Math.round(currCountry.rights[`${esrStandard}Historical`][2015].GDP).toLocaleString()} (current PPP dollars)</div>
              </div>
              <div className={styles.rightInfoWrapper}>
                <div className={styles.rightInfo}>
                  { (isESRSelected || currRight === 'all') &&
                    <div>
                      <div className={styles.subtitleESR}>Economic and Social Rights</div>
                      <div className={styles.esrChartSubtitle}>most recent data (2015 or earlier)</div>
                      <div className={styles.barChartWrapper} style={{ height: 80 }}>
                        <BarChartESR data={currCountry.rights[esrStandard]} />
                      </div>
                      { currRight !== 'all' &&
                        <div>
                          <div className={styles.esrRegionValue}>Right to {getRegionName(urlSegs.region)} 22%</div>
                          <ul className={styles.esrValueList}>
                            <li className={styles.withDot}>Primary school completion rate 11%</li>
                            <li className={styles.withDot}>Gross combined school entolment rate 33%</li>
                          </ul>
                        </div>
                      }
                    </div>
                  }
                  { (isCPRSelected || currRight === 'all') &&
                    <div>
                      { currCountry.rights.cpr &&
                        <div>
                          <div className={styles.subtitleCPR}>Civil and Political Rights</div>
                          <div className={styles.cprChartSubtitle}>data is for period january - june 2017</div>
                          <div className={styles.barChartWrapper}>
                            <BarChartCPR data={currCountry.rights.cpr} height={80} />
                          </div>
                          <div className={styles.legend}>
                            <div className={styles.meanText}>Mean score</div>
                            <div className={styles.bar}></div>
                            <div className={styles.textContainer}>
                              <div className={styles.maxText}>90<sup>th</sup> percentile</div>
                              <div className={styles.minText}>10<sup>th</sup> percentile</div>
                            </div>
                          </div>
                        </div>
                      }
                      { currRight !== 'all' &&
                        <div>
                          <div className={styles.cprRegionValue}>Right to {getRegionName(urlSegs.region)} 22%</div>
                          <ul className={styles.esrValueList}>
                            <li className={styles.withDot}>Primary school completion rate 11%</li>
                            <li className={styles.withDot}>Gross combined school entolment rate 33%</li>
                          </ul>
                        </div>
                      }
                    </div>
                  }
                  {
                    currRight === 'all'
                    ? <div className={styles.countryQues}>
                      <QuestionTooltip width={288} question={content.country_tooltips[0].question}>
                        <p>{content.country_tooltips[0].paragraphs} <a href='https://humanrightsmeasurement.org/methodology/methodology-in-depth/' target='_blink'>{content.country_tooltips[0].linkText}</a>.</p>
                      </QuestionTooltip>
                      <QuestionTooltip width={244} question={content.country_tooltips[1].question}>
                        <p>{content.country_tooltips[1].paragraphs}</p>
                      </QuestionTooltip>
                      <QuestionTooltip width={286} question={content.country_tooltips[2].question}>
                        <p>{content.country_tooltips[2].paragraphs}</p>
                      </QuestionTooltip>
                    </div>
                    : <div className={styles.rightDefinition}>
                      <div className='arrowLink' style={{ marginLeft: '-24px' }}>
                        <div className='text'>Explore this rights in:</div>
                        <div className='text underline' onClick={this.setExploreBy}>{getRegionName(urlSegs.region)}</div>
                      </div>
                      { rightsDefinitions[currRight].definition
                        ? <p className={styles.definition}>{rightsDefinitions[currRight].definition}</p>
                        : <ul>
                          {rightsDefinitions[currRight].measure_list.map((item, i) => {
                            return (<li key={i} className={styles.defList}>{item}</li>)
                          })}
                        </ul>
                      }

                      { isESRSelected &&
                        <p className={styles.measureQues}>{content.question_tooltips[3].question} {currRight}?</p>
                      }
                      { rightsDefinitions[currRight].core_text &&
                        <div>
                          <p>{rightsDefinitions[currRight].core_text}</p>
                          <ul>
                            {
                              rightsDefinitions[currRight].core_indicator.map((item, i) => (
                                <li key={i} className={styles.withDot}>{item}</li>
                              ))
                            }
                          </ul>
                        </div>
                      }
                      { showMore && rightsDefinitions[currRight].high_text &&
                        <div>
                          <p>{rightsDefinitions[currRight].high_text}</p>
                          <ul>
                            {
                              rightsDefinitions[currRight].high_indicator.map((item, i) => (
                                <li key={i} className={styles.withDot}>{item}</li>
                              ))
                            }
                          </ul>
                        </div>
                      }
                      { showMore && isESRSelected &&
                        <QuestionTooltip width={238} question={content.question_tooltips[0].question}>
                          <p>{content.question_tooltips[0].tooltip}</p>
                        </QuestionTooltip>
                      }
                      { showMore && currRight === 'food' &&
                        <QuestionTooltip width={360} question={content.question_tooltips[1].question}>
                          <p>{content.question_tooltips[1].tooltip.paragraphs[0]}</p>
                          <p>{content.question_tooltips[1].tooltip.paragraphs[1]}</p>
                          <ul>
                            <li>{content.question_tooltips[1].tooltip.list[0]}</li>
                            <li>{content.question_tooltips[1].tooltip.list[1]}</li>
                            <li>{content.question_tooltips[1].tooltip.list[2]}</li>
                          </ul>
                          <p className={styles.tooptipLink}>{content.question_tooltips[1].tooltip.paragraphs[2]} <a href='https://humanrightsmeasurement.org/methodology/measuring-economic-social-rights/' target='_blank'>{content.question_tooltips[1].tooltip.linkText}</a>.</p>
                        </QuestionTooltip>
                      }
                      { showMore && isCPRSelected &&
                        <div>
                          <QuestionTooltip width={293} question={content.question_tooltips[2].question}>
                            <p>{content.question_tooltips[2].tooltip.paragraphs[0]}</p>
                            <p>{content.question_tooltips[2].tooltip.paragraphs[1]}</p>
                            <p className={styles.tooptipLink}>{content.question_tooltips[2].tooltip.paragraphs[2]} <a href='#' target='_blank'>{content.question_tooltips[2].tooltip.linkText}</a>.</p>
                          </QuestionTooltip>
                          <QuestionTooltip width={294} question={content.question_tooltips[3].question + ' ' + currRight + '?'}>
                            <p>{content.question_tooltips[3].tooltip.paragraphs[0]}</p>
                            <p className={styles.tooptipLink}>{content.question_tooltips[3].tooltip.paragraphs[1]} <a href='https://humanrightsmeasurement.org/methodology/methodology-in-depth/' target='_blank'>{content.question_tooltips[3].tooltip.linkText}</a>.</p>
                          </QuestionTooltip>
                        </div>
                      }
                      <div className={styles.showMoreBtn} onClick={this.toggleShowMore}>{showMore ? 'Show less' : 'Show more'}</div>
                      { isESRSelected &&
                        <div>
                          <div className={styles.subtitleESR}>Right trend over time</div>
                          <div className={styles.esrChartKey}>This chart shows data using the core country standard.</div>
                        </div>
                      }
                      { isCPRSelected &&
                        <div>
                          <div>
                            <QuestionTooltip width={214} question={'Groups most at risk'} isTitle={true}>
                              <p>This word-cloud illustrates the groups considered by survey respondents to be most at risk for violations of this right. Greater prominence is given to the names of groups that were most frequently indicated as being especially vulnerable. For more information about the targeted groups see our <a href='#' target='_blank'>summary of qualitative survey responses.[need link]</a></p>
                            </QuestionTooltip>
                            <ul className={styles.groupsList}>
                              <li>nationality</li>
                              <li>other immigrant</li>
                              <li>political indigenous</li>
                              <li>professional disabled journalist</li>
                              <li>low ses refugees cultrue</li>
                            </ul>
                          </div>
                          <div>
                            <QuestionTooltip width={220} question={'Distribution of abuse'} isTitle={true}>
                              <p>This chart indicates how violations of this right are distributed across different groups. Bar heights indicate the percentage of survey respondents who selected each group as being especially vulnerable.</p>
                            </QuestionTooltip>
                            <div className={styles.cprChartSubtitle}>Data is for period January - June 2017</div>
                            <div className={styles.chartKeys}>
                              <strong>A:</strong> Suspected criminals, <strong>B:</strong> Non-violent political, <strong>C:</strong> Violent political, <strong>D:</strong> Discriminated groups, <strong>E:</strong> Indiscriminate
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
