export function  getErrorMessage(error: any): string {
    if (error instanceof Error) {
        const e = error as Error;
        return e.message;
    }
    if (error instanceof Response) {
       const e = error as Response;
       return e.statusText;
    }
    return error;
}