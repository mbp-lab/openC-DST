import Slide from "@material-ui/core/Slide";
import VisualAnalogueScale from "../components/VisualAnalogueScale";
import React from "react";
import i18next from "i18next";
import Button from "@material-ui/core/Button";
import Panas from "../components/Panas";
import {CircularProgress} from "@material-ui/core";
import {CancelButton} from "../components/CancelButton";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";


export default class EndPage extends React.Component{
    constructor() {
        super();
        this.state = {
            showCircularProgress: false
        }
    }

    render() {
        let config = new Blob([`save_all_data\n${Date.now()}\n${this.props.studyMetaTracker.studyTitle}\n${this.props.studyMetaTracker.studyUuid}`], {type: 'text/plain'});
        return<>
            <Slide direction="right" in={this.props.activeSlide === 'vas'} mountOnEnter unmountOnExit>
                <VisualAnalogueScale
                    stressImpression={'end'}
                    handleNext={this.props.handleNext}
                    handBackStressData={this.props.handBackStressData}
                    handleCancelDialog={this.props.handleCancelDialog}
                />
            </Slide>
            <Slide direction="right" in={this.props.activeSlide === 'panas'} mountOnEnter unmountOnExit>
                <Panas
                    studyPage='endPage'
                    continueFromPanas={this.props.continueFromPanas}
                    referenceTime={this.props.referenceTime}
                    handleCancelDialog={this.props.handleCancelDialog}
                />
            </Slide>
            <Slide direction="right" in={this.props.activeSlide === 'explanation'} mountOnEnter unmountOnExit>
                <div>
                    <Card>
                        <div className="row py-2 justify-content-center index-body-header">
                            {i18next.t('end.explanation.heading')}
                        </div>
                        <CardContent className="py-0">
                            <div className="row py-2 justify-content-center p-0">
                                <i> {i18next.t('end.explanation.text_0')} </i>
                            </div>
                            <div className="row justify-content-center p-0">
                                <div className="col-12">
                                    <ul className="list-styled ul end-stepper-bullet-point">
                                        <li className="pb-1">{i18next.t('end.explanation.text_1')}</li>
                                        <li className="pb-1">{i18next.t('end.explanation.text_2')}</li>
                                        <li className="pb-1">{i18next.t('end.explanation.text_3')}</li>
                                        <li className="pb-1">{i18next.t('end.explanation.text_4')}</li>
                                        <li className="pb-1">{i18next.t('end.explanation.text_5')}</li>
                                        {
                                            process.env.REACT_APP_LOGGING === 'true'
                                                ? <>
                                                    <li className="pb-1 font-weight-bold">{i18next.t('end.questionnaire.heading')}</li>
                                                    <li className="pb-1 font-weight-bold">{i18next.t('end.questionnaire.studyResultId')}{this.props.studyMetaTracker.studyResultId}</li>
                                                </>
                                                : <li className="pb-1 font-weight-bold">{i18next.t('end.explanation.noLogging')}</li>
                                        }
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="row justify-content-center align-items-center pb-3">
                        <div className="p-2">
                            <CancelButton handleCancelDialog={this.props.handleCancelDialog}/>
                        </div>
                        {!this.state.showCircularProgress
                            ?
                            <div className="p-2">
                                <Button
                                    variant="contained"
                                    size="medium"
                                    className="alert-buttons"
                                    onClick={() => {
                                        this.props.uploadFinalData(config, false);
                                        this.setState({
                                            showCircularProgress: true,
                                        });
                                        setTimeout(() => {
                                                this.props.handleNext();
                                            },
                                            1000
                                        );
                                    }}>
                                    {i18next.t('end.questionnaire.finish')}
                                </Button>
                            </div>
                            :<CircularProgress/>
                        }
                    </div>
                </div>
            </Slide>
            <Slide direction="right" in={this.props.activeSlide === 'questionnaire'} mountOnEnter unmountOnExit>
                <div>
                    <div className="row justify-content-center py-2">
                        <div className="col-12">
                            <div className="font-weight-bold">
                                {
                                    process.env.REACT_APP_LOGGING === 'true'
                                        ? i18next.t('end.questionnaire.all_data_saved')
                                        : i18next.t('end.explanation.noLogging')
                                }
                            </div>
                        </div>
                    </div>
                    <div className="row justify-content-center py-2">
                        <div className="col-12">
                            <div className="font-weight-bold">
                                {i18next.t('end.questionnaire.thanking')}
                            </div>
                        </div>
                    </div>
                    <div className="row justify-content-center py-2">
                        <div className="col-12">
                            <Button
                                variant="contained"
                                size="medium"
                                className="alert-buttons"
                                onClick={() => {
                                    if (process.env.REACT_APP_LOGGING === 'true') {
                                        jatos.endStudyAndRedirect(this.props.studyMetaTracker.surveyURL, true, "study completed successfully")//eslint-disable-line no-undef
                                    } else {
                                        jatos.endStudy(true, "study completed successfully");//eslint-disable-line no-undef
                                    }
                                }}>
                                {i18next.t('end.questionnaire.soci_survey')}
                            </Button>
                        </div>
                    </div>
                    <div className="row justify-content-center pt-4">
                        <div className="col-12">
                            <div className="end-contact-us">
                                {i18next.t('end.questionnaire.contact_us') + ' ' + i18next.t('end.questionnaire.mail')}
                            </div>
                        </div>
                    </div>
                </div>
            </Slide>
        </>

    }
}
