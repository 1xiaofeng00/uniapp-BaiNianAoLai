export default{
    state:{
        orderNumber:''
    },
    getters:{},
    mutations:{
        initOrder( state , order ){
            state.orderNumber = order;
        }
    }
}