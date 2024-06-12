import store from '../store/index'
export const useOptionsLimit = (questionKey) => {
  const options = store.state.questionData[questionKey].options.map((option) => {
    if(option.limit){
      const optionHash = option.hash
      
      const selectCount = store.state.limitMap?.[questionKey]?.[optionHash] || 0
      const release = option.limit - selectCount
      return {
        ...option,
        disabled: release === 0,
        selectCount,
      }
    } else {
      return {
        ...option,
      }
    }
  })

  return { options }
}
