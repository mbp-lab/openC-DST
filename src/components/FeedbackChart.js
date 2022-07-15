import React from 'react';
import i18next from "i18next";

class FeedbackChart extends React.Component {
    render() {
        return (
            <div className="container feedback-mathTask-missing-interaction-alt">
                <div className="font-weight-bold text-center">
                    {i18next.t('mathTaskAlt.header')}
                </div>
                <div className="font-weight-regular text-center">
                    {i18next.t('mathTaskAlt.default_interaction')}
                </div>
            </div>
        );
    }
}

export default FeedbackChart;
