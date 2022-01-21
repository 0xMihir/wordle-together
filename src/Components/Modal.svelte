<script>
    export let title = ''
    export let modalShow = false
</script>

<div class="modal-background" style="display: {modalShow ? 'block' : 'none'};">
    <div class="modal-content">
        <h1>
            {title}
        </h1>
        <slot/>
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
        border-radius: 4px;
        min-width: 280px;
        width: fit-content;
        display: flex;
        flex-direction: column;
        gap: 28px;
        padding-top: calc(40px - 1.5em);
        padding-left: 24px;
        justify-content: center;
        box-shadow: 0px 11px 15px -7px rgb(0 0 0 / 20%), 0px 24px 38px 3px rgb(0 0 0 / 14%), 0px 9px 46px 8px rgb(0 0 0 / 12%);
    }
    .modal-content h1 {
        font-size: 1.5em;
    }

    .modal-content :global(.actions)  {
        align-self: flex-end;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-end;
        gap: 8px;
        margin: 8px;
    }
     .modal-content  :global(.actions button) {
        border: none;
        background: none;
        color: var(--color-primary);
        cursor: pointer;
        text-transform: uppercase;
        transition: background-color 280ms cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center; 
        justify-content: center;
        height: 36px;
        font-size: 16px;
        line-height: 16px;
        padding: 8px;
        margin: 0;
        font-weight: 500;
    }
    .modal-content  :global(.actions button:hover) {
        background-color: var(--color-primary-light);
    }
    .modal-content  :global(.actions button:active) {
        background-color: var(--color-primary-light2);
    }
</style>
