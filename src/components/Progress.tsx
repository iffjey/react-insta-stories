import React, { useContext } from 'react'
import { ProgressProps, ProgressContext } from './../interfaces'
import ProgressCtx from './../context/Progress'

export default (props: ProgressProps) => {
    const { active, count } = props;
    const { bufferAction, pause } = useContext<ProgressContext>(ProgressCtx)

    const getWrapperStyle = () => ({
        opacity: pause && !bufferAction ? 0 : 1
    })

    const getProgressStyle = () => {
        switch (active) {
            case 2:
                return { transform: `translateX(0)` }
            case 1:
                return { transform: `translateX(${-100 + count}%)`, borderRadius: '3px' }
            case 0:
                return { transform: `translateX(-101%)` }
            default:
                return { transform: `translateX(-101%)` }
        }
    }

    return (
        <div style={{ ...styles.wrapper, ...getWrapperStyle() }}>
            <div style={{ ...styles.progress, ...getProgressStyle() }} />
        </div>
    )
}

const styles: any = {
    wrapper: {
        height: '2px',
        borderRadius: '3px',
        background: '#555',
        overflow: 'hidden',
        transition: 'opacity 400ms ease-in-out'
    },
    progress: {
        background: '#fff',
        height: '100%',
        willChange: 'transform'
    }
}