import React, { Component } from 'react';
import AudioVisualiser from './AudioVisualiser';
import i18next from "i18next";

class AudioAnalyser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            audioData: new Uint8Array(0),
            audio:null,
            fftSampleSize: 1024,
        };
        this.tick = this.tick.bind(this);
        this.setupAudioWave = this.setupAudioWave.bind(this)
        this.checkAudioStreamForInput = this.checkAudioStreamForInput.bind(this)

        this.audioTimestampStream = []
        this.requestToSpeak = false
    }

    componentDidMount() {
        this.setState({ audio:this.props.stream });
    }

    componentWillUnmount() {
        if(this.state.audio !== null) {
            cancelAnimationFrame(this.rafId);
            this.analyserTimeDomain.disconnect();
            this.source.disconnect();
        }
        clearInterval(this.interval);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.audio !== null  && this.state.audio !== prevState.audio) {
            this.setupAudioWave();
        }
    }

    setupAudioWave() {
        this.reference = Date.now()
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyserTimeDomain = this.audioContext.createAnalyser();
        this.analyserFrequencyDomain =this.audioContext.createAnalyser();
        this.analyserFrequencyDomain.fftSize = this.state.fftSampleSize;

        this.dataArrayTD = new Uint8Array(this.analyserTimeDomain.frequencyBinCount);
        this.dataArrayFD = new Uint8Array(this.analyserFrequencyDomain.frequencyBinCount);

        this.source = this.audioContext.createMediaStreamSource(this.state.audio);
        this.source.connect(this.analyserTimeDomain);
        this.rafId = requestAnimationFrame(this.tick);
    }

    checkAudioStreamForInput(audioData) {
        let totalValue = 0;
        let totalNulls = 0;
        let mean;
        if (audioData != null) {
            for (let item of audioData) {
                totalValue += item;
                if(item === 0) {
                    ++totalNulls;
                }
            }
        }
        mean = totalValue / (this.state.fftSampleSize/2)

        const audioTimestamp = {
            mean: mean,
            totalValue: totalValue,
            totalNulls : totalNulls
        }
        return audioTimestamp
    }

    tick() {
        // Copies the current Waveform as an array of integers from
        // the AnalyserNode into the dataArray
        this.analyserTimeDomain.getByteTimeDomainData(this.dataArrayTD);
        this.analyserTimeDomain.getByteFrequencyData(this.dataArrayFD)

        if(this.props.state === 'recording') {

            let analyzedAudioChunk = this.checkAudioStreamForInput(this.dataArrayFD)
            this.audioTimestampStream.push(analyzedAudioChunk)

            let length = this.audioTimestampStream.length
            if (length >= 61) {
                // compute totalmean which is a mean over 60 values
                let totalMean = 0;
                for (let step = 0; step <= 60; step++) {
                    totalMean = totalMean + this.audioTimestampStream[step].mean;
                }
                totalMean = totalMean /61;
                if (totalMean <= 7) {
                    if(this.props.state === 'recording') {
                        this.props.updateSpeechTaskFeedback({
                            subjectId: this.props.studyResultId,
                            stage: this.props.stage,
                            feedback: true,
                            noiseLevel: totalMean,
                            relativeTime: 20000 - this.props.remainingMilliseconds
                        })
                    }
                    this.requestToSpeak = true;
                } else {
                    if(this.props.state === 'recording') {
                        this.props.updateSpeechTaskFeedback({
                            subjectId: this.props.studyResultId,
                            stage: this.props.stage,
                            feedback: false,
                            noiseLevel: totalMean,
                            relativeTime: 20000 - this.props.remainingMilliseconds
                        })
                    }
                    this.requestToSpeak = false;
                }
                this.audioTimestampStream = []
            }
        }
        this.setState({ audioData: this.dataArrayTD });
        this.rafId = requestAnimationFrame(this.tick);
    }

    render() {
        return (
            <div>
                {this.requestToSpeak ? <SpeakUp style={{height: this.props.height, width: this.props.width}}/> : <AudioVisualiser audioData={this.state.audioData} height={this.props.height} width={this.props.width} />}
            </div>
        )
    }
}

export default AudioAnalyser;

const SpeakUp = (props) => {
    return(
        <div style={props.style} className="d-flex align-items-center justify-content-center">
            <div className="alert alert-danger" role="alert">
                {i18next.t('audioAnalyzing.speak')}
            </div>
        </div>
    )
}
