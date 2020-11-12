import React, { useContext, useState, useEffect, useRef, useLayoutEffect } from 'react'
import Progress from './Progress'
import { ProgressContext, GlobalCtx, StoriesContext as StoriesContextInterface } from './../interfaces'
import ProgressCtx from './../context/Progress'
import GlobalContext from './../context/Global'
import StoriesContext from './../context/Stories'

export default () => {
    const [count, setCount] = useState<number>(0)
    const { currentId, next, videoDuration, pause } = useContext<ProgressContext>(ProgressCtx)
    const { defaultInterval, onStoryEnd, onStoryStart, onAllStoriesEnd } = useContext<GlobalCtx>(GlobalContext);
    const { stories } = useContext<StoriesContextInterface>(StoriesContext);

    const animationFrameId = useRef<number>()
    const countRef = useRef<number>()

    console.log('render::pause', { pause })

    useLayoutEffect(() => {
        console.log('progress array::use effect')
        function incrementCount() {
            console.log('progress array::increment count')
            if (countRef.current === 0) storyStartCallback()


            setCount((count: number) => {
                const interval = getCurrentInterval()
                const newCount = Math.min(count + (100 / ((interval / 1000) * 60)), 100);
                countRef.current = newCount
                return newCount
            })

            if (countRef.current < 100) {
                console.log('progress array::increment count::raw retry')
                animationFrameId.current = requestAnimationFrame(incrementCount)
            } else {
                console.log('progress array::increment count::cancel')
                cancelAnimationFrame(animationFrameId.current)

                storyEndCallback()

                if (currentId === stories.length - 1) {
                    allStoriesEndCallback()
                } else {
                    setCount(0);
                }

                next()
            }
        }
        if (!pause) {
            console.log('progress array::use effect::not pause start')
            animationFrameId.current = requestAnimationFrame(incrementCount)
        }
        return () => {
            console.log('progress array::use effect::teardown cancel')
            cancelAnimationFrame(animationFrameId.current)
        }
    }, [currentId, pause])

    useEffect(() => {
        setCount(0)
    }, [currentId, stories])


    const storyStartCallback = () => {
        onStoryStart && onStoryStart(currentId, stories[currentId])
    }

    const storyEndCallback = () => {
        onStoryEnd && onStoryEnd(currentId, stories[currentId])
    }

    const allStoriesEndCallback = () => {
        onAllStoriesEnd && onAllStoriesEnd(currentId, stories)
    }

    const getCurrentInterval = () => {
        if (stories[currentId].type === 'video') return videoDuration
        if (typeof stories[currentId].duration === 'number') return stories[currentId].duration
        return defaultInterval
    }

    const getActiveStatus = (index: number): number => {
        if (index === currentId) {
            return count >= 100 ? 2 : 1 
        };

         return index < currentId ? 2 : 0;
    }

    return (
        <div style={styles.progressArr}>
            {stories.map((_, i) =>
                <Progress
                    key={i}
                    count={count}
                    active={getActiveStatus(i)}
                />
            )}
        </div>
    )
}

const styles = {
    progressArr: {
        boxSizing: 'border-box',
        position: 'absolute',
        display: 'grid',
        gridAutoFlow: 'column',
        gridGap: '3px',
        width: '100%',
        padding: '9px',
        zIndex: 99,
        filter: 'drop-shadow(0 1px 8px #222)'
    }
}