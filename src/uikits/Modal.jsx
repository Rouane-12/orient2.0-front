import useModalStore from "../stores/modal";

export default function Modal() {
    const { isOpen, closeModal, content } = useModalStore();

    if (!isOpen) return;
    return <div className="modal flex">
        <div className="modalBody">
            <section className="mb-closer" onClick={closeModal}>X</section>
            <section className="mb-content">
                {content}
            </section>
        </div>
    </div>
}