<script>
    export let text = ''
    export let modalShow = false
</script>

<div class="modal-background" style="display: {modalShow ? 'block' : 'none'};">
    <div class="modal-content">
        <span>
            {text}
        </span>
    </div>
</div>

<style>
    .modal-background {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: rgba(0, 0, 0, 0.3);
        z-index: 1;
    }
    .modal-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: var(--color-bg);
        padding: 20px;
        border-radius: 5px;
        width: fit-content;
        height: 10%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .modal-content span {
        font-size: 1.5em;
        text-align: center;
    }
</style>
