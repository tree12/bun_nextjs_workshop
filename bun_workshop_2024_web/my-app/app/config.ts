import Swal from "sweetalert2";
export const config={
    apiUrl:'http://localhost:3001',
    tokenKey:'token_bun_service',
    confirmDialog: () => {
        return Swal.fire({
            icon: 'question',
            iconColor: '#9ca3af',
            title: 'ยืนยันการลบ',
            text: 'คุณต้องการลบรายการนี้หรือไม่',
            showCancelButton: true,
            background: '#1f2937',
            color: '#9ca3af',
            customClass: {
                title: 'custom-title-class',
                htmlContainer: 'custom-text-class'
            }
        });
    }
}

export default config;