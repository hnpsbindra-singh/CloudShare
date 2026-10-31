package com.testing.springpractice.cloudshare;

import java.util.Arrays;

class Solution {
    static int f(int i, int target, int[] arr, int[][] dp){

        if (target == 0) {
            return dp[i][target] = 1;
        }
        if (i==0){
            if (arr[i]==target){
                return dp[i][target] = 1;
            }else {
                return dp[i][target] = 0;
            }
        }
        if (dp[i][target]!=-1){
            return dp[i][target];
        }
        int not = f(i-1, target, arr, dp);
        int take = 0;
        if (arr[i]<=target){
            take = f(i-1, target-arr[i], arr, dp);
        }
        return dp[i][target] = not+take;
    }
    static int perfectSum(int[] arr, int target) {
        int[][] dp = new int[arr.length][target+1];
        for (int[] i: dp) {
            Arrays.fill(i, -1);
        }
        return f(arr.length-1, target, arr, dp);

    }
}