import React, { useState } from "react";
import classNames from "../utils/class-names";
import useInterval from "../utils/useInterval";



// These functions are defined outside of the component to ensure they do not have access to state
// and are, therefore, more likely to be pure.

/**
 * Update the session state with new state after each tick of the interval.
 * @param prevState
 *  the previous session state
 * @returns
 *  new session state with timing information updated.
 */
function nextTick(prevState) {
  //  console.log(prevState)
  const timeRemaining = Math.max(0, prevState.timeRemaining - 1)
  return {
    ...prevState,
    timeRemaining,
  };
}

/**
 * Higher-order function that returns a function to update the session state with the next session type upon timeout.
 * @param focusDuration
 *    the current focus duration
 * @param breakDuration
 *    the current break duration
 * @returns
 *  function to update the session state.
 */
function nextSession(focusDuration, breakDuration) {
  /**
   * State function to transition the current session type to the next session. e.g. On Break -> Focusing or Focusing -> On Break
   */
  return (currentSession) => {
    if (currentSession.label === "Focusing") {
      return {
        label: "On Break",
        timeRemaining: breakDuration * 60,
      };
    }
    return {
      label: "Focusing",
      timeRemaining: focusDuration * 60,
    };
  };
}

function Pomodoro() {
  // Timer starts out paused
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  
  // The current session - null where there is no session running
  const [session, setSession] = useState(null);

  // ToDo: Allow the user to adjust the focus and break duration.
  
  
  const timeClock = (num) => {
    let minutes = Math.floor(num / 60)
    let seconds = num - (minutes * 60)
    if (seconds < 10) {
      seconds = "0" + seconds
    }
    if (minutes < 10) {
      minutes = "0" + minutes
    }
    return minutes + ":" + seconds
  }

  const [focusDuration, setfocusDuration] = useState(25)
  // const focusDuration = 25;
  const [breakDuration, setBreakDuration] = useState(5)
  // const breakDuration = 5;

  /**
   * Custom hook that invokes the callback function every second
   *
   * NOTE: You won't need to make changes to the callback function
   */
  useInterval(() => {
    if(session) {
      if (session.timeRemaining === 0) {
        new Audio("https://bigsoundbank.com/UPLOAD/mp3/1482.mp3").play();
        return setSession(nextSession(focusDuration, breakDuration));
      }
      return setSession(nextTick);
    }},
    isTimerRunning ? 1000 : null
  );

  /**
   * Called whenever the play/pause button is clicked.
   */
  function playPause() {
    setIsTimerRunning((prevState) => {
      const nextState = !prevState;
      if (nextState) {
        setSession((prevStateSession) => {
          // If the timer is starting and the previous session is null,
          // start a focusing session.
          if (prevStateSession === null) {
            return {
              label: "Focusing",
              timeRemaining: focusDuration * 60,
            };
          }
          return prevStateSession;
        });
      }
      return nextState;
    });
  }
  


    const focusTimeHandler = (event) => {
      if (event.target.id === "minus") {
        if (focusDuration < 6) {
          setfocusDuration(focusDuration)
        } else {
        setfocusDuration(focusDuration - 5)
       }
     } else {
       if (focusDuration > 59) {
        setfocusDuration(focusDuration)
       } else {
        setfocusDuration(focusDuration + 5)
       }
      }
    }
    
    const breakTimeHandler = (event) => {
      if (event.target.id === "minus") {
        if (breakDuration < 2) {
          setBreakDuration(breakDuration)
        } else {
        setBreakDuration(breakDuration - 1)
        }
      } else {
        if (breakDuration > 14) {
          setBreakDuration(breakDuration)
        } else {
        setBreakDuration(breakDuration + 1)
      }
    }
    }
    
    const resetHandler = () => {
      setSession(null)
    }
    
    const progressBar = () => {
      if (session.label === "Focusing") {
      const currentPercent = 1 - ((session.timeRemaining) / (focusDuration * 60))
      const percentNow = (currentPercent * 100)
      return percentNow
      } else {
      const currentPercent = 1 - ((session.timeRemaining) / (breakDuration * 60))
      const percentNow = (currentPercent * 100)
      return percentNow
      }
    }

    const ableDisable = () => {
      if (session == null) {
        return true
      } else {
        return false
      }
    }

    const remainingTime = () => {
      if (session.label == "Focusing") {
        return timeClock(focusDuration * 60)
      } else {
        return timeClock(breakDuration * 60)
      }
    }

  return (
    <div className="pomodoro">
      <div className="row">
        <div className="col">
          <div className="input-group input-group-lg mb-2">
            <span className="input-group-text" data-testid="duration-focus">
              {/* TODO: Update this text to display the current focus session duration */}
              Focus Duration: {timeClock((focusDuration * 60))}
            </span>
            <div className="input-group-append">
              {/* TODO: Implement decreasing focus duration and disable during a focus or break session */}
              <button
                type="button"
                className="btn btn-secondary"
                
              >
                {session? <span className="oi oi-minus" id="minus"/> :
                <span className="oi oi-minus" onClick={focusTimeHandler} id="minus" data-testid="decrease-focus"/>
                }
              </button>
              {/* TODO: Implement increasing focus duration and disable during a focus or break session */}
              <button
                type="button"
                className="btn btn-secondary"
                
              >
                {session? <span className="oi oi-plus" id="plus"/> :
                <span className="oi oi-plus" onClick={focusTimeHandler} id="plus" data-testid="increase-focus"/>
                }
              </button>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="float-right">
            <div className="input-group input-group-lg mb-2">
              <span className="input-group-text" data-testid="duration-break">
                {/* TODO: Update this text to display the current break session duration */}
                Break Duration: {timeClock(breakDuration * 60)}
              </span>
              <div className="input-group-append">
                {/* TODO: Implement decreasing break duration and disable during a focus or break session*/}
                <button
                  type="button"
                  className="btn btn-secondary"
                  
                >
                  {session? <span className="oi oi-minus"/> : 
                  <span className="oi oi-minus" onClick={breakTimeHandler} id="minus" data-testid="decrease-break"/>
                  }
                </button>
                {/* TODO: Implement increasing break duration and disable during a focus or break session*/}
                <button
                  type="button"
                  className="btn btn-secondary"
                  
                >
                  {session? <span className="oi oi-plus"/> : 
                  <span className="oi oi-plus" onClick={breakTimeHandler} id="plus" data-testid="increase-break"/>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div
            className="btn-group btn-group-lg mb-2"
            role="group"
            aria-label="Timer controls"
          >
            <button
              type="button"
              className="btn btn-primary"
              data-testid="play-pause"
              title="Start or pause timer"
              onClick={playPause}
            > 
              <span
                className={classNames({
                  oi: true,
                  "oi-media-play": !isTimerRunning,
                  "oi-media-pause": isTimerRunning,
                })}
              />
              
            </button>
            {/* TODO: Implement stopping the current focus or break session. and disable the stop button when there is no active session */}
            {/* TODO: Disable the stop button when there is no active session */}
            <button
            
              type="button"
              className="btn btn-secondary"
              data-testid="stop"
              title="Stop the session"
              disabled={ableDisable()}
              onClick={resetHandler}
            >
              
              <span className="oi oi-media-stop" />
              
            </button>
          </div>
        </div>
      </div>
      <div>
        {/* TODO: This area should show only when there is an active focus or break - i.e. the session is running or is paused */}
        <div className="row mb-2">
          {session?
          <div className="col" >
            {/* TODO: Update message below to include current session (Focusing or On Break) total duration */}
            <h2 data-testid="session-title">
              {session?.label} for {remainingTime()} minutes
            </h2>
            {/* TODO: Update message below correctly format the time remaining in the current session */}
            <p className="lead" data-testid="session-sub-title">
              {session? timeClock(session.timeRemaining): null} remaining
            </p>
          </div>
          : null}
        </div>
        {session? (isTimerRunning? null : <h2>PAUSED</h2>) : null}
        <div className="row mb-2">
          {session?
          <div className="col">
            <div className="progress" style={{ height: "20px" }}>
              <div
                className="progress-bar"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={progressBar()} // TODO: Increase aria-valuenow as elapsed time increases
                style= {{width: `${progressBar()}%`}}  // TODO: Increase width % as elapsed time increases
              />
            </div>
          </div>
          : null}
        </div>
      </div>
    </div>
  );
}

export default Pomodoro;
