import React from "react";
import i18next from "i18next";
import {CancelButton} from "../components/CancelButton";
import Button from "@material-ui/core/Button";

export default class MathTaskResult extends React.Component {
    render() {
        return <div className="container-fluid">
            <div className="row font-weight-bold free-speech-tutorial-header">
                {i18next.t('speechTaskTutorial.results.heading')}
            </div>
            <div className="row justify-content-center py-2">
                <div className="col-12 visual-analog-scale">
                    <div className="font-weight-bold ">
                        {i18next.t('speechTaskTutorial.results.result_1_1')}
                    </div>
                    {this.props.mathTaskScore + ' ' + i18next.t('speechTaskTutorial.results.result_1_2')}
                </div>
            </div>
            <div className="row justify-content-center align-items-center pb-3">
                <div className="p-2">
                    <CancelButton handleCancelDialog={this.props.handleCancelDialog}/>
                </div>
                <div className="p-2">
                    <Button
                        variant="contained"
                        size="medium"
                        className="alert-buttons"
                        onClick={this.props.handleNext}
                    >
                        {i18next.t('stepper.button_next')}
                    </Button>
                </div>
            </div>
        </div>
    }
}