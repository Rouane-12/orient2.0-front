import useModalStore from "../stores/modal";
import { useEffect, useRef } from "react";

export default function Modal() {
    const { isOpen, closeModal, content } = useModalStore();
    const modalRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            document.body.style.position = "fixed";
            document.body.style.width = "100%";
            document.body.style.top = `-${window.scrollY}px`;
        } else {
            const scrollY = document.body.style.top;
            document.body.style.overflow = "";
            document.body.style.position = "";
            document.body.style.width = "";
            document.body.style.top = "";
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }

        return () => {
            const scrollY = document.body.style.top;
            document.body.style.overflow = "";
            document.body.style.position = "";
            document.body.style.width = "";
            document.body.style.top = "";
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        };
    }, [isOpen]);

    useEffect(() => {
        const handleWheel = (e) => {
            if (modalRef.current && modalRef.current.contains(e.target)) {
                e.stopPropagation();
            }
        };

        if (isOpen) {
            window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
        }

        return () => {
            window.removeEventListener('wheel', handleWheel, { capture: true });
        };
    }, [isOpen, modalRef]);

    if (!isOpen) return null;

    return (
        <div className="modal" ref={modalRef}>
            <div className="modalBody">
                <button
                    className="mb-closer"
                    onClick={closeModal}
                    type="button"
                >
                    X
                </button>

                <div className="mb-content">
                    {content}
                </div>
            </div>
        </div>
    );
}