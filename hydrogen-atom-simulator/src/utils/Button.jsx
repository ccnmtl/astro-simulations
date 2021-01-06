import React from "react";

export default (props) => {
    return (
        <button type="box"
                className="sliderButtons"
                id={props.id}
                onClick={props.changeSliderValue}
        >
            {props.symbol}
        </button>
    )
}

