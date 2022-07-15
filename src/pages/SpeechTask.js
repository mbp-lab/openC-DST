import React from 'react';
import i18next from "i18next";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import AssignmentIcon from '@material-ui/icons/Assignment';
import AudioAnalyser from "../components/AudioAnalyser";
import hobby from "../img/FreeSpeechImages/hobby.jpg";
import movie from "../img/FreeSpeechImages/movie.jpg";
import seasons from "../img/FreeSpeechImages/seasons.jpg";
import {CancelButton} from "../components/CancelButton";
import SpeechTaskStart from "../components/SpeechTaskStart";
import CountdownSpeechTask from "../components/CountdownSpeechTask";
import {calculateWidthInPx, calculateHeightInPx} from "../utils";


export default class SpeechTask extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mediaStream: null,
            hasUserMedia: false,

            speechTaskStates: [
                ["start", "dot-white", i18next.t('speechTask.header.start'), i18next.t('speechTask.question_0.header'),i18next.t('speechTask.question_0.question')],
                ["introTask1", "dot-white", i18next.t('speechTask.header.state_prepare'), i18next.t('speechTask.question_0.header'),i18next.t('speechTask.question_0.question')],
                ["runTask1", "dot-red", i18next.t('speechTask.header.state_run'), i18next.t('speechTask.question_0.header'), i18next.t('speechTask.feedback_0')],
                ["introTask2", "dot-white", i18next.t('speechTask.header.state_prepare'), i18next.t('speechTask.question_1.header'),i18next.t('speechTask.question_1.question')],
                ["runTask2", "dot-red", i18next.t('speechTask.header.state_run'), i18next.t('speechTask.question_1.header'), i18next.t('speechTask.feedback_0')],
                ["introTask3", "dot-white", i18next.t('speechTask.header.state_prepare'), i18next.t('speechTask.question_2.header'),i18next.t('speechTask.question_2.question')],
                ["runTask3", "dot-red", i18next.t('speechTask.header.state_run'), i18next.t('speechTask.question_2.header'), i18next.t('speechTask.feedback_0')]
            ],
            speechTaskStateCounter: 0,

            changePicManager: [seasons, seasons, seasons, movie, movie, hobby, hobby],
            startMilliseconds: 10000,
            remainingMilliseconds: 10000,
            startTime: null,
        };
        this.incrementSpeechTaskStateCounter = this.incrementSpeechTaskStateCounter.bind(this);
        this.saveSpeechTaskFeedback = this.saveSpeechTaskFeedback.bind(this);

        this.audioWaveWidth = calculateWidthInPx(80);
        this.audioWaveHeight = calculateHeightInPx(15);

        this.intervalID = null;
        this.timeoutID = null;
    }

    componentDidMount() {
        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
        }).then((stream) => this.setState({
            mediaStream: stream,
            hasUserMedia: true,
        }))
        this.setState({
            webcamHeight: calculateHeightInPx(15),
            webcamWidth: calculateWidthInPx(70),
        });
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.speechTaskStateCounter !== this.state.speechTaskStateCounter ) {
            if (this.state.speechTaskStateCounter === 1){
                this.props.startSpeechTask()
                this.speechTaskEngine();
            }
        }
        if (prevProps.cancelDialogIsOpen !== this.props.cancelDialogIsOpen) {
            if (this.props.cancelDialogIsOpen) {
                clearInterval(this.intervalID);
                clearTimeout(this.timeoutID);
                this.setState({
                    hasUserMedia: false,
                    startMilliseconds: this.state.remainingMilliseconds
                });
            } else {
                if (this.state.speechTaskStateCounter > 0) {
                    navigator.mediaDevices.getUserMedia({
                        audio: true,
                        video: false
                    }).then((stream) => this.setState({
                        mediaStream: stream,
                        hasUserMedia: true,
                    }))
                    this.speechTaskEngine();
                }
            }
        }
    }

    saveSpeechTaskFeedback(feedback2) {
        for (let i = 0; i < feedback2.length; i++) {
            this.feedback.push(feedback2[i])
        }
    }

    speechTaskEngine() {
        this.setState(() => {
            return {
                startTime: Date.now(),
            }
        });
        this.intervalID = setInterval(() => {
            this.setState((state) => {
                return {remainingMilliseconds: state.startMilliseconds - (Date.now() - state.startTime)}
            })
        }, 1);
        if(["introTask1","introTask2","introTask3"].includes(this.state.speechTaskStates[this.state.speechTaskStateCounter][0])){
            this.timeoutID = setTimeout( () => {
                    clearInterval(this.intervalID)
                    this.setState({
                        startMilliseconds: 20000,
                        remainingMilliseconds: 20000,
                        speechTaskStateCounter: this.state.speechTaskStateCounter + 1,
                    })
                    this.speechTaskEngine();
                }, this.state.startMilliseconds);
        } else {
            this.timeoutID = setTimeout( () => {
                clearInterval(this.intervalID)
                if (this.state.speechTaskStateCounter === this.state.speechTaskStates.length - 1) {
                    this.props.endSpeechTask();
                } else {
                    this.setState({
                        startMilliseconds: 10000,
                        remainingMilliseconds: 10000,
                        speechTaskStateCounter: this.state.speechTaskStateCounter + 1,
                    }, () => this.speechTaskEngine())
                }
            }, this.state.startMilliseconds);
        }
    }

    incrementSpeechTaskStateCounter() {
        this.setState({
            speechTaskStateCounter: this.state.speechTaskStateCounter + 1
        })
    }

    render() {
        let background = null;
        let questionState = null;
        if (this.state.speechTaskStateCounter < 7) {
            switch (this.state.speechTaskStates[this.state.speechTaskStateCounter][0]) {
                case "introTask1":
                case "introTask2":
                case "introTask3":
                    background = "row speechTask-prepare";
                    questionState = "intro";
                    break;
                case "runTask1":
                case "runTask2":
                case "runTask3":
                    background = "row speechTask-speak";
                    questionState = "run";
                    break;
                default:
                    break;
            }
        }
        return (
            this.state.speechTaskStateCounter < 1
                ? <SpeechTaskStart
                    studyResultId={this.props.studyResultId}
                    handleCancelDialog={this.props.handleCancelDialog}
                    speechTaskStates={this.state.speechTaskStates}
                    speechTaskStateCounter={this.state.speechTaskStateCounter}
                    signal_given={this.state.signal_given}
                    volume={this.state.volume}
                    incrementSpeechTaskStateCounter={this.incrementSpeechTaskStateCounter}
                />
                : <div>
                    <div className="container-fluid p-0">
                        <div className={background}>
                            <div className="col">
                                <div className="row justify-content-center py-2">
                                    <div className="col-10">
                                        <div className="speechTask-header-wait">
                                            {this.state.speechTaskStates[this.state.speechTaskStateCounter][2]}
                                        </div>
                                    </div>
                                </div>
                                <div className="row justify-content-center">
                                    {questionState === 'run' && !this.props.cancelDialogIsOpen && this.state.hasUserMedia
                                        ? <AudioAnalyser
                                            state='recording'
                                            stream={this.state.mediaStream}
                                            height={this.audioWaveHeight}
                                            width={this.audioWaveWidth}
                                            stage={this.state.speechTaskStates[this.state.speechTaskStateCounter][0]}
                                            updateSpeechTaskFeedback={this.props.updateSpeechTaskFeedback}
                                            remainingMilliseconds={this.state.remainingMilliseconds}
                                            studyResultId={this.props.studyResultId}
                                        />
                                        : null
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="container-fluid p-0">
                        <div className="row justify-content-center py-2">
                            <div className="col-8 speechTask-countdown align-items-center">
                                <CountdownSpeechTask
                                    remainingMilliseconds={this.state.remainingMilliseconds}
                                    speechTaskStateCounter={this.state.speechTaskStateCounter}
                                />
                            </div>
                        </div>
                    </div>
                    {
                        this.state.speechTaskStateCounter > 0
                            ? <div className="container-fluid p-0">
                                <img src={this.state.changePicManager[this.state.speechTaskStateCounter]} alt="" width="100%" height="auto" />
                                <div className="row justify-content-center py-0 px-2">
                                    <Card>
                                        <CardContent className="py-0">
                                            <div className="row align-items-center border border-dark font-weight-bold">
                                                <div className="col-12 align-items-center p-0 ">
                                                    <AssignmentIcon style={{fontSize: 'medium'}}/>
                                                    <strong className="free-speech-tutorial-header">
                                                        {this.state.speechTaskStates[this.state.speechTaskStateCounter][3]}
                                                    </strong>
                                                </div>
                                            </div>
                                            <div className="speechTask-question">
                                                {this.state.speechTaskStates[this.state.speechTaskStateCounter][4]}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                            : <div/>
                    }
                    <div className="row justify-content-center align-items-center p-2">
                        <CancelButton handleCancelDialog={this.props.handleCancelDialog}/>
                    </div>
                </div>
        )
    }
}
