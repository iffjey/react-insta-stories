import React, { useContext, useState, useRef, useEffect } from 'react'
import GlobalContext from './../context/Global'
import StoriesContext from './../context/Stories'
import ProgressContext from './../context/Progress'
import Story from './Story'
import ProgressArray from './ProgressArray'
import { GlobalCtx, StoriesContext as StoriesContextInterface } from './../interfaces'

export default function () {
    const [currentId, setCurrentId] = useState<number>(0)
    const [pause, setPause] = useState<boolean>(true)
    const [bufferAction, setBufferAction] = useState<boolean>(true)
    const [videoDuration, setVideoDuration] = useState<number>(0)

    let mousedownId = useRef<any>();

    const { width, height, loop, currentIndex, isPaused, controlsNavigation, renderNavigationControl, keyboardNavigation, onPreviousStory, onNextStory } = useContext<GlobalCtx>(GlobalContext);
    const { stories } = useContext<StoriesContextInterface>(StoriesContext);

    useEffect(() => {
        if (typeof currentIndex === 'number') {
            if (currentIndex >= 0 && currentIndex < stories.length) {
                setCurrentId(currentIndex)
            } else {
                console.error('Index out of bounds. Current index was set to value more than the length of stories array.', currentIndex)
            }
        }
    }, [currentIndex])

    useEffect(() => {
        if (typeof isPaused === 'boolean') {
            setPause(isPaused)
        }
    }, [isPaused])

    useEffect(() => {
        const isClient = (typeof window !== 'undefined' && window.document);
        if (isClient && (typeof keyboardNavigation === 'boolean' && keyboardNavigation)) {
            document.addEventListener("keydown", handleKeyDown);
            return () => {
                document.removeEventListener("keydown", handleKeyDown);
            }
        }
    }, [currentId, keyboardNavigation])

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
            previous()
        }
        else if (e.key === 'ArrowRight') {
            next()
        }
    }

    const toggleState = (action: string, bufferAction?: boolean) => {
        setPause(action === 'pause')
        setBufferAction(!!bufferAction)
    }

    const previous = () => {
        const hasPrevious = currentId > 0;
        const previousId = currentId - 1;

        setCurrentId(hasPrevious ? previousId : currentId)

        if (onPreviousStory) {
            const args = hasPrevious ? [previousId, stories[previousId]] : [null, null];
            onPreviousStory(...args)
        }
    }

    const next = () => {
        if (loop) {
            updateNextStoryIdForLoop()
        } else {
            updateNextStoryId()
        }
    };

    const updateNextStoryIdForLoop = () => {
        const nextId = (currentId + 1) % stories.length;

        setCurrentId(nextId)

        if (onNextStory) {
            onNextStory(nextId, stories[nextId])
        }
    }

    const updateNextStoryId = () => {
        const hasNext = currentId < stories.length -1
        const nextId = currentId + 1;

        setCurrentId(hasNext ? nextId : currentId)

        if (onNextStory) {
            const args = hasNext ? [nextId, stories[nextId]] : [null, null];
            onNextStory(...args)
        }
    }

    const debouncePause = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault()
        mousedownId.current = setTimeout(() => {
            toggleState('pause')
        }, 200)
    }

    const mouseUp = (e: React.MouseEvent | React.TouchEvent, type: string) => {
        e.preventDefault()
        mousedownId.current && clearTimeout(mousedownId.current)
        if (pause) {
            toggleState('play')
        } else {
            type === 'next' ? next() : previous()
        }
    }

    const getVideoDuration = (duration: number) => {
        setVideoDuration(duration * 1000)
    }

    return (
        <div style={{ ...styles.container, ...{ width, height } }}>
            <ProgressContext.Provider value={{
                bufferAction: bufferAction,
                videoDuration: videoDuration,
                currentId,
                pause,
                next
            }}>
                <ProgressArray />
            </ProgressContext.Provider>
            <Story
                action={toggleState}
                bufferAction={bufferAction}
                playState={pause}
                story={stories[currentId]}
                getVideoDuration={getVideoDuration}
            />
            <div style={styles.overlay}>
                <div style={{ width: '50%', zIndex: 999 }} onTouchStart={debouncePause} onTouchEnd={e => mouseUp(e, 'previous')} onMouseDown={debouncePause} onMouseUp={(e) => mouseUp(e, 'previous')} />
                <div style={{ width: '50%', zIndex: 999 }} onTouchStart={debouncePause} onTouchEnd={e => mouseUp(e, 'next')} onMouseDown={debouncePause} onMouseUp={(e) => mouseUp(e, 'next')} />
            </div>
            {(controlsNavigation && renderNavigationControl) && (
                <div style={styles.overlay}>
                    {renderNavigationControl({direction: 'previous', onClick: previous})}
                    {renderNavigationControl({direction: 'next', onClick: next})}
                </div>
            )}
        </div>
    )
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
    },
    overlay: {
        position: 'absolute',
        height: 'inherit',
        width: 'inherit',
        display: 'flex'
    }
}