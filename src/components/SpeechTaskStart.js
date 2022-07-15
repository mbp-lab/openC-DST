import React from 'react';
import Button from '@material-ui/core/Button';
import i18next from "i18next";
import ExplanationSpeechTask from "./ExplanationSpeechTask";

export default class SpeechTaskStart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            countDownTimer: 3,

            countdownBegins: false,

            buttonState: 'explain',
        };
        this.startCountdown = this.startCountdown.bind(this);
        this.changeStartExplanation = this.changeStartExplanation.bind(this);
    }

    startCountdown(){
        this.setState({
            buttonState: 'countdown'
        })
        let countdown = setInterval(
            ()=>{
                this.setState({
                    countDownTimer: this.state.countDownTimer - 1,
                })
            }, 1000)
        setTimeout(() => {
            clearInterval(countdown)
            this.props.incrementSpeechTaskStateCounter();
        }, 3000)
    }

    changeStartExplanation() {
        this.setState({buttonState: 'start'})
    }

    render() {
        let button = null;
        if (this.state.buttonState === 'explain') {
            button =
                <ExplanationSpeechTask
                    changeStartExplanation={this.changeStartExplanation}
                />
        } else if (this.state.buttonState === 'start') {
            button =
                <Button
                    variant="contained"
                    size="large"
                    className="speechTask-countdown-button"
                    onClick={() => {
                            this.startCountdown();
                    }}
                >
                    {i18next.t('button.start')}
                </Button>
        } else if (this.state.buttonState === 'countdown') {
            button =
                <div className="text-center countdownSpeechTask">
                    {this.state.countDownTimer}
                </div>
        }
        return (
            <div className="container-fluid p-0">
                <div className="row speechTask-start justify-content-center py-2">
                    <div className="col-8 ">
                        <div className="speechTask-header-wait">
                            {this.props.speechTaskStates[this.props.speechTaskStateCounter][2]}
                        </div>
                    </div>
                </div>
                <div className="row justify-content-center p-1">
                    {button}
                </div>
            </div>
        )
    }
}
