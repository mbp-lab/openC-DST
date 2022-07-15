import React from "react";
import FeedbackChart from "../components/FeedbackChart";
import Progressbar from "../components/ProgressBar";
import TaskFrame from "../components/TaskFrame";
import NumberInputField from "../components/NumberInputField";
import {CancelButton} from "../components/CancelButton";
import i18next from "i18next";


const correct = '#49E3AC';
const bgDefault = 'white';

let resetBackground = () => {
    setTimeout(() => {
        document.body.style.setProperty('background-color', bgDefault);
    }, 1000);
};

function backgroundColorChange(currentFeedback){
    switch (currentFeedback) {
        case 'correct':
            document.body.style.setProperty('background-color', correct);
            resetBackground();
            break;
        default:
            break;
    }
};

export default class MathTask extends React.Component {
    constructor() {
        super();
        this.state = {
            taskList: this.generateTaskQuestions(500), // A list that will hold the on the fly computed math task questions
            numberInput: '',
            currentFeedback: 'default', // feedback can be default, wrong, correct, slow, missingInteraction
            questionCounter: 0,
            correctAnswerCounter: 0,
            streakCountingObject: {streakType: null, streak: 0}, // Streak can be correct or wrong streak
            ButtonsDisabled: false,
            timePaused: 0, // the time a single task is paused in seconds
            pauseStart: null,
            elapsedTimeCurrentQuestion: 0,
            questionDuration: 3000,
        }

        this.handleNumberInput = this.handleNumberInput.bind(this);

        this.testStartTimestamp = Date.now();
        this.taskBeginTime = null;
        this.timeoutProgressBarID = null;
        this.currentQuestionIndex = 0;
        this.timer = null;
        this.noAnswerStreak = 0;
        this.mathTask_seconds = 0;
        this.MATHTASK_TOTAL_SECONDS = 90;
    }

    componentDidMount() {
        this.props.uploadData('mathTask_start', null)
        this.timer = setInterval(() => {
            this.mathTask_seconds = this.mathTask_seconds + 1
        }, 1000);
        this.questionCountDown();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.currentFeedback !== prevState.currentFeedback) {
            this.questionCountDown()
        }
        if (prevProps.cancelDialogIsOpen !== this.props.cancelDialogIsOpen) {
            if (this.props.cancelDialogIsOpen) {
                this.setState({
                    pauseStart: Date.now(),
                })
                clearInterval(this.timer);
                clearTimeout(this.timeoutProgressBarID);
            } else {
                this.timer = setInterval(() => {
                    this.mathTask_seconds = this.mathTask_seconds + 1
                }, 1000);
                this.setState((state, props) => ({
                    timePaused: state.timePaused + Date.now() - state.pauseStart,
                }), () => {
                    this.updateTimer();
                })
            }
        }
    }

    componentWillUnmount() {
        clearTimeout(this.timeoutProgressBarID)
        clearInterval(this.timer);
    }

    handleNumberInput(event) {
        if (this.state.currentFeedback === 'default') {
            const tempNumberInput = this.state.numberInput + event.target.id;
            const lengthOfAnswer = () => {
                if (this.getCurrentQuestion().answer > 99) {
                    return 3
                } else if (this.getCurrentQuestion().answer > 9) {
                    return 2
                } else {
                    return 1
                }
            };
            this.noAnswerStreak = 0;
            if (tempNumberInput === this.getCurrentQuestion().answer.toString()) {
                this.setState({
                    numberInput: tempNumberInput,
                    currentFeedback: 'correct',
                });
                //if the input number is incorrect!
            } else if (tempNumberInput.length === lengthOfAnswer() && tempNumberInput !== this.getCurrentQuestion().answer.toString()) {
                this.setState({
                    numberInput: tempNumberInput,
                    currentFeedback: 'wrong',
                });
                //If input is still being accepted (neither correct nor incorrect!)
            } else {
                this.setState({
                    numberInput: tempNumberInput,
                })
            }
        }
    }

    getCurrentQuestion() {
        return this.state.taskList[this.currentQuestionIndex]
    }

    updateTimer() {
        if (!this.props.cancelDialogIsOpen) {
            if (this.mathTask_seconds > this.MATHTASK_TOTAL_SECONDS) {
                this.props.endMathTask(this.state.correctAnswerCounter);
            } else if (this.state.currentFeedback === 'default') {
                const taskElapsedTime = Date.now() - this.taskBeginTime;
                if (taskElapsedTime < this.state.questionDuration + this.state.timePaused) {
                    this.timeoutProgressBarID = setTimeout(() => {
                            this.setState({
                                elapsedTimeCurrentQuestion: taskElapsedTime - this.state.timePaused
                            });
                            this.updateTimer();
                        },
                        10
                    );
                } else {
                    if (this.noAnswerStreak >= 5) {
                        this.noAnswerStreak = this.noAnswerStreak + 1;
                        this.setState({
                            currentFeedback: 'missingInteraction',
                        })
                    } else {
                        this.noAnswerStreak = this.noAnswerStreak + 1;
                        this.setState({
                            currentFeedback: 'slow',
                        });
                    }
                }
            }
        }
    }

    incrementQuestionIndex() {
        if (this.noAnswerStreak === 5) {
            this.currentQuestionIndex += 1;
            while (this.getCurrentQuestion().operator !== '+') {
                this.currentQuestionIndex += 1;
            }
        } else {
            this.currentQuestionIndex += 1;
        }
    }

    questionCountDown() {
        if (this.mathTask_seconds > this.MATHTASK_TOTAL_SECONDS) {
            this.props.endMathTask(this.state.correctAnswerCounter);
        } else if (this.state.currentFeedback === "default") {
            this.taskBeginTime = Date.now();
            this.updateTimer();
        } else {
            let timeout;
            let isAnswerCorrect;
            switch (this.state.currentFeedback) {
                case "correct":
                    timeout = 50;
                    isAnswerCorrect = true;
                    this.setState((state, props) => ({
                        ButtonsDisabled: true,
                        questionCounter: state.questionCounter + 1,
                        correctAnswerCounter: state.correctAnswerCounter + 1,
                    }))
                    break;
                case "wrong":
                    timeout = 1000;
                    isAnswerCorrect = false;
                    this.setState((state, props) => ({
                        ButtonsDisabled: true,
                        questionCounter: state.questionCounter + 1
                    }))
                    break;
                case "slow" :
                case "missingInteraction":
                    timeout = 1000;
                    isAnswerCorrect = null;
                    this.setState((state, props) => ({
                        ButtonsDisabled: true,
                        questionCounter: state.questionCounter + 1
                    }))
                    break;
                default:
                    break;
            }
            this.props.updateMathTaskPerformance(isAnswerCorrect, this.noAnswerStreak, this.state.elapsedTimeCurrentQuestion / 1000, this.state.timePaused,
                this.state.questionDuration, this.currentQuestionIndex, (this.state.taskBeginTime - this.state.testStartTimestamp) / 1000,
                (Date.now() - this.state.testStartTimestamp) / 1000, this.state.taskList, this.state.numberInput, this.state.currentFeedback);
            this.adaptQuestionDurationBasedOnCurrentScoring();
            this.incrementQuestionIndex();
            setTimeout(() => {
                this.setState({
                    currentFeedback: 'default',
                    numberInput: '',
                    ButtonsDisabled: false,
                    timePaused: 0,
                });
            }, timeout);
        }
    }

    // Method gets invoked whenever the time adaption alg of the mathtask needs to be ajusted
    adaptQuestionDurationBasedOnCurrentScoring() {
        let streakCountingObjectTemp = this.state.streakCountingObject;
        switch (this.state.currentFeedback) {
            case 'correct':
                if (streakCountingObjectTemp.streakType === 'correct') {
                    streakCountingObjectTemp.streak = streakCountingObjectTemp.streak + 1;
                } else {
                    streakCountingObjectTemp.streakType = 'correct';
                    streakCountingObjectTemp.streak = 1;
                }
                break;
            case 'wrong' :
            case 'slow':
            case 'missingInteraction':
                if (streakCountingObjectTemp.streakType === 'wrong') {
                    streakCountingObjectTemp.streak = streakCountingObjectTemp.streak + 1;
                } else {
                    streakCountingObjectTemp.streakType = 'wrong';
                    streakCountingObjectTemp.streak = 1;
                }
                break;
            default :
                break;
        }
        this.setState({
            streakCountingObject: streakCountingObjectTemp,
        })
        if (this.state.streakCountingObject.streak === 4 && this.state.streakCountingObject.streakType === 'correct') {
            let questionDurationTemp = this.state.questionDuration;
            questionDurationTemp = questionDurationTemp * 9 / 10;
            this.setState({
                streakCountingObject: {
                    streakType: null,
                    streak: 0,
                },
                questionDuration: questionDurationTemp,
            });
        }
        if (this.state.streakCountingObject.streak === 1 && this.state.streakCountingObject.streakType === 'wrong') {
            let questionDurationTemp = this.state.questionDuration;
            questionDurationTemp = questionDurationTemp * 11 / 10;
            this.setState({
                streakCountingObject: {
                    streakType: null,
                    streak: 0,
                },
                questionDuration: questionDurationTemp,
            });
        }
    }

    //Method that generates mathTask questions. Does some filtering of suitable mathTask questions
    generateTaskQuestions(numberOfTasks) {
        let taskList = [];
        let i = 1;
        while (taskList.length < numberOfTasks) {
            const mathQuestion = {};
            mathQuestion.id = i;
            const mathTerm1 =Math.round(Math.random()*100);
            const mathTerm2= Math.round(Math.random()*100);
            const operatorList = ['+'];
            const randomOperator = operatorList[Math.floor(Math.random() * operatorList.length)];
            mathQuestion.operator = randomOperator;
            switch (randomOperator) {
                case '+':
                    mathQuestion.question = mathTerm1 + ' + ' + mathTerm2;
                    mathQuestion.answer = mathTerm1 + mathTerm2;
                    break;
                default:
                    return null;
            }
            if (mathQuestion.answer !== undefined && mathQuestion.answer !== 0 && mathQuestion.answer < 100) {
                taskList.push(mathQuestion);
            }
            ++i;
        }
        return taskList;
    }

    render() {
        backgroundColorChange(this.state.currentFeedback);
        return (
            <div>
                <section className="graphicalFeedback">
                    {this.noAnswerStreak >= 5
                        ?
                        <div className="container d-flex h-100">
                            <div className="row justify-content-center align-self-center">
                                <div className="alert alert-danger" role="alert">
                                    <div className="font-weight-bold text-center">
                                        {i18next.t('mathTask.header')}
                                    </div>
                                    {i18next.t('mathTask.missing_interaction')}
                                </div>
                            </div>
                        </div>
                        :
                        <FeedbackChart/>
                    }
                </section>
                <section className="taskSection">
                    <Progressbar
                        questionCurrentInPercentage={Math.round(this.state.elapsedTimeCurrentQuestion / this.state.questionDuration * 100)}
                        studyPage='mathTask'
                    />
                    <TaskFrame
                        currentNumberInput={this.state.numberInput}
                        currentQuestion={this.getCurrentQuestion()}
                        currentFeedback={this.state.currentFeedback}
                    />
                </section>
                <section className="inputSection">
                    <NumberInputField
                        numberInputLayoutIsRandom={false}
                        handleNumberInput={this.handleNumberInput}
                        isDisabled={this.state.ButtonsDisabled}
                    />
                    <div className="row justify-content-center align-items-center p-2">
                        <CancelButton handleCancelDialog={this.props.handleCancelDialog}/>
                    </div>
                </section>
            </div>
        );
    }
}