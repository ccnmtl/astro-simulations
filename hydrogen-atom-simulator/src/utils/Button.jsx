import React from "react";

export default (props) => {
    return (
        <button type="button"
                className="sliderButtons btn btn-sm"
                id={props.id}
                onClick={props.changeSliderValue}>
            {props.symbol}
        </button>
    );
}

