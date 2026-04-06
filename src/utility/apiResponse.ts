class ApiResponse {
    statusCode: number;
    message: string;
    data: any;
    success: boolean;

    constructor(data: any, message: string = "success", statusCode: number){
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode < 400;
    }
}

export { ApiResponse };