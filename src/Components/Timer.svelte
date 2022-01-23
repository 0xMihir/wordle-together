<script>
    let time = 0
    let minutes = 0
    let seconds = 0
    let interval
    export const startTimer = () => {
        interval = setInterval(
            handleTimer, 1000)
    }
    export const stopTimer = () => {
        clearInterval(interval)
    }
    export const getTime = () => {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
    const handleTimer = () => {
        time += 1
        minutes = Math.floor(time / 60)
        seconds = time % 60
    }
</script>


<div class="timer">
    <span class="material-icons-outlined">
        timer
    </span>
    <span class="time">
        {minutes}:{seconds.toString().padStart(2, '0')}
    </span>
</div>

<style> 
    .timer {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .timer span {
        font-size: 20px;
        font-weight: bold;
    }
    .timer .time {
        min-width: 50px;
        text-align: left;
    }
</style>